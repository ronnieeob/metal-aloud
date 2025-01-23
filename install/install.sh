#!/bin/bash

# Metal Aloud Installation Script
set -e

echo "🎸 Installing Metal Aloud..."

# Configuration
APP_NAME="metal-aloud"
APP_DIR="/var/www/$APP_NAME"
NGINX_CONF="/etc/nginx/sites-available/$APP_NAME"
DOMAIN="srv685290.hstgr.cloud " # Change this to your domain
NODE_VERSION="22"

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

# Error handling
error() {
    echo -e "${RED}Error: $1${NC}" >&2
    exit 1
}

# Function to check command status
check_command() {
    if [ $? -ne 0 ]; then
        error "$1"
    fi
}

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    error "Please run as root"
fi

# Update system packages
echo "📦 Updating system packages..."
apt update && apt upgrade -y
check_command "Failed to update system packages"

# Install required packages
echo "📦 Installing dependencies..."
apt install -y \
    curl \
    wget \
    git \
    nginx \
    build-essential \
    python3 \
    python3-pip \
    certbot \
    python3-certbot-nginx \
    redis-server \
    imagemagick \
    ffmpeg
check_command "Failed to install dependencies"

# Install Node.js
echo "📦 Installing Node.js $NODE_VERSION..."
curl -fsSL https://deb.nodesource.com/setup_${NODE_VERSION}.x | bash -
apt install -y nodejs npm
check_command "Failed to install Node.js"

# Install PM2
echo "📦 Installing PM2..."
npm install -g pm2@latest
check_command "Failed to install PM2"

# Ensure PM2 is in PATH
export PATH="$PATH:/usr/local/bin"
hash -r

# Create app directory
echo "📂 Creating application directory..."
mkdir -p $APP_DIR
check_command "Failed to create app directory"

# Clone repository
echo "📥 Cloning repository..."
git clone https://github.com/ronnieeob/metal-aloud.git $APP_DIR
check_command "Failed to clone repository"

# Install dependencies
echo "📦 Installing npm dependencies..."
cd $APP_DIR
npm install
check_command "Failed to install npm dependencies"

# Create environment file
echo "🔧 Creating environment file..."
cp .env.example .env
check_command "Failed to create .env file"

# Build application
echo "🏗️ Building application..."
npm run build
check_command "Failed to build application"

# Configure Nginx
echo "🔧 Configuring Nginx..."
cat > $NGINX_CONF << EOL
server {
    listen 80;
    server_name $DOMAIN;
    root $APP_DIR/dist;
    index index.html;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types text/plain text/css text/xml application/json application/javascript application/xml+rss application/atom+xml image/svg+xml;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Content-Security-Policy "default-src 'self' https: data: 'unsafe-inline' 'unsafe-eval';" always;

    # API proxy
    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
        
        # Rate limiting
        limit_req zone=api burst=20 nodelay;
        limit_req_status 429;
    }

    # Static file serving
    location / {
        try_files \$uri \$uri/ /index.html;
        expires 30d;
        add_header Cache-Control "public, no-transform";
    }

    # Cache control for static assets
    location /assets/ {
        expires 1y;
        add_header Cache-Control "public, no-transform";
        access_log off;
    }

    # Deny access to sensitive files
    location ~ /\. {
        deny all;
    }
    
    location ~ ^/(\.env|composer\.json|package\.json|package-lock\.json)$ {
        deny all;
    }
}

# Rate limiting zones
limit_req_zone \$binary_remote_addr zone=api:10m rate=10r/s;
EOL
check_command "Failed to create Nginx configuration"

# Enable site
ln -sf $NGINX_CONF /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t
check_command "Nginx configuration test failed"
systemctl restart nginx
check_command "Failed to restart Nginx"

# Install SSL certificate
echo "🔒 Installing SSL certificate..."
certbot --nginx -d $DOMAIN --non-interactive --agree-tos --email admin@$DOMAIN
check_command "Failed to install SSL certificate"

# Configure PM2
echo "⚙️ Configuring PM2..."
cat > $APP_DIR/ecosystem.config.js << EOL
module.exports = {
  apps: [{
    name: '$APP_NAME',
    script: 'dist/server/index.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3001
    }
  }]
};
EOL
check_command "Failed to create PM2 configuration"

# Start application
echo "🚀 Starting application..."
cd $APP_DIR
pm2 start ecosystem.config.js
pm2 save
pm2 startup
check_command "Failed to start application"

# Set proper permissions
echo "🔐 Setting permissions..."
chown -R www-data:www-data $APP_DIR
find $APP_DIR -type d -exec chmod 755 {} \;
find $APP_DIR -type f -exec chmod 644 {} \;
chmod 400 $APP_DIR/.env
check_command "Failed to set permissions"

# Configure firewall
echo "🔒 Configuring firewall..."
ufw allow 'Nginx Full'
ufw allow OpenSSH
ufw --force enable
check_command "Failed to configure firewall"

# Create backup script
echo "📦 Creating backup script..."
cat > /usr/local/bin/backup-metal-aloud.sh << EOL
#!/bin/bash
BACKUP_DIR=/var/backups/metal-aloud
DATE=\$(date +%Y%m%d_%H%M%S)

# Create backup directory
mkdir -p \$BACKUP_DIR

# Backup application files
tar -czf \$BACKUP_DIR/files_\$DATE.tar.gz $APP_DIR

# Rotate old backups (keep last 7 days)
find \$BACKUP_DIR -type f -mtime +7 -delete
EOL
check_command "Failed to create backup script"

chmod +x /usr/local/bin/backup-metal-aloud.sh

# Schedule backup
(crontab -l 2>/dev/null; echo "0 2 * * * /usr/local/bin/backup-metal-aloud.sh") | crontab -
check_command "Failed to schedule backup"

# Configure log rotation
echo "📝 Configuring log rotation..."
cat > /etc/logrotate.d/metal-aloud << EOL
$APP_DIR/logs/*.log {
    daily
    rotate 14
    compress
    delaycompress
    notifempty
    create 0640 www-data www-data
    sharedscripts
    postrotate
        [ -f /var/run/nginx.pid ] && kill -USR1 \$(cat /var/run/nginx.pid)
    endscript
}
EOL
check_command "Failed to configure log rotation"

echo -e "${GREEN}✨ Installation complete!${NC}"
echo "🌎 Your application is now running at https://$DOMAIN"
echo -e "\nUseful commands:"
echo "- View logs: pm2 logs $APP_NAME"
echo "- Monitor: pm2 monit"
echo "- Restart: pm2 restart $APP_NAME"
echo "- Run backup: /usr/local/bin/backup-metal-aloud.sh"