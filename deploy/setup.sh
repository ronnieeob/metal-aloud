#!/bin/bash

# Exit on error
set -e

echo "🎸 Setting up Metal Aloud on Hostinger VPS..."

# Update system
echo "📦 Updating system packages..."
apt-get update
apt-get upgrade -y

# Install required packages
echo "📦 Installing dependencies..."
apt-get install -y \
    nginx \
    mysql-server \
    nodejs \
    npm \
    git \
    ufw

# Configure firewall
echo "🔒 Configuring firewall..."
ufw allow 'Nginx Full'
ufw allow OpenSSH
ufw allow 3306
ufw --force enable

# Install Node.js and PM2
echo "📦 Installing Node.js dependencies..."
npm install -g pm2

# Create web directory
echo "📂 Creating web directory..."
mkdir -p /var/www/metal-aloud
chown -R www-data:www-data /var/www/metal-aloud

# Configure MySQL
echo "🗄️ Setting up MySQL..."
mysql_secure_installation

# Create database and user
echo "Creating database and user..."
mysql -e "CREATE DATABASE IF NOT EXISTS metal_aloud;"
mysql -e "CREATE USER IF NOT EXISTS 'metal_aloud'@'localhost' IDENTIFIED BY '${DB_PASSWORD}';"
mysql -e "GRANT ALL PRIVILEGES ON metal_aloud.* TO 'metal_aloud'@'localhost';"
mysql -e "FLUSH PRIVILEGES;"

# Import database schema
mysql metal_aloud < database/schema.sql

# Configure Nginx
echo "🔧 Configuring Nginx..."
cp deploy/nginx.conf /etc/nginx/sites-available/srv685290.hstgr.cloud
ln -sf /etc/nginx/sites-available/srv685290.hstgr.cloud /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Test Nginx configuration
nginx -t

# Restart Nginx
systemctl restart nginx

# Set up SSL with Let's Encrypt
echo "🔒 Setting up SSL..."
certbot --nginx -d srv685290.hstgr.cloud --non-interactive --agree-tos --email admin@srv685290.hstgr.cloud

# Clone repository
echo "📥 Cloning repository..."
git clone https://github.com/yourusername/metal-aloud.git /var/www/metal-aloud/repo

# Install dependencies and build
cd /var/www/metal-aloud/repo
npm install
npm run build

# Copy build files
cp -r dist/* /var/www/metal-aloud/

# Set up PM2 for Node.js server
echo "🚀 Setting up PM2..."
pm2 start ecosystem.config.js
pm2 save
pm2 startup

echo "✨ Setup complete! Access your site at https://your-domain.com"