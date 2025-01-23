# Metal Aloud Installation Guide

## System Requirements

### Minimum Hardware Requirements
- CPU: 2 cores
- RAM: 2GB
- Storage: 20GB SSD
- Bandwidth: 100Mbps

### Software Requirements
- Ubuntu 20.04 LTS or higher
- Node.js 22+
- Nginx or Apache
- SSL certificate
- Domain name pointed to your server

## Quick Installation

1. SSH into your server:
```bash
ssh root@your-server-ip
```

2. Download the installation script:
```bash
wget https://raw.githubusercontent.com/ronnieeob/metal-aloud/main/install/install.sh
```

3. Make it executable:
```bash
chmod +x install.sh
```

4. Run the installation:
```bash
sudo ./install.sh
```

## Manual Installation

### 1. Prepare System

```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Install required packages
sudo apt install -y curl wget git build-essential nginx certbot python3-certbot-nginx
```

### 2. Install Node.js 22

```bash
# Install NVM
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc

# Install Node.js
nvm install 22
nvm use 22
nvm alias default 22
```

### 3. Clone Repository

```bash
# Create app directory
sudo mkdir -p /var/www/metal-aloud
cd /var/www/metal-aloud

# Clone repository
git clone https://github.com/yourusername/metal-aloud.git .
```

### 4. Install Dependencies

```bash
# Install PM2 globally
npm install -g pm2

# Install project dependencies
npm install
```

### 5. Configure Environment

```bash
# Copy environment file
cp .env.example .env

# Edit environment variables
nano .env
```

Required environment variables:
```env
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_key

# Domain Configuration
DOMAIN=your-domain.com
ADMIN_EMAIL=admin@your-domain.com
```

### 6. Build Application

```bash
# Build the application
npm run build
```

### 7. Configure Web Server

#### For Nginx:

```bash
# Create Nginx configuration
sudo nano /etc/nginx/sites-available/metal-aloud

# Enable site
sudo ln -s /etc/nginx/sites-available/metal-aloud /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl restart nginx
```

Nginx configuration:
```nginx
server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com;

    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;

    root /var/www/metal-aloud/dist;
    index index.html;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Content-Security-Policy "default-src 'self' https: data: 'unsafe-inline' 'unsafe-eval';" always;

    # API proxy
    location /api {
        proxy_pass http://localhost:3002;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Static files
    location / {
        try_files $uri $uri/ /index.html;
        expires 30d;
        add_header Cache-Control "public, no-transform";
    }
}
```

#### For Apache:

```bash
# Enable required modules
sudo a2enmod rewrite headers expires deflate

# Restart Apache
sudo systemctl restart apache2
```

Create `.htaccess` file:
```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>

# Security headers
<IfModule mod_headers.c>
  Header set X-Content-Type-Options "nosniff"
  Header set X-XSS-Protection "1; mode=block"
  Header set X-Frame-Options "SAMEORIGIN"
  Header set Referrer-Policy "strict-origin-when-cross-origin"
</IfModule>
```

### 8. SSL Certificate

```bash
# Install SSL certificate
sudo certbot --nginx -d your-domain.com
```

### 9. Start Application

```bash
# Create PM2 ecosystem file
cat > ecosystem.config.js << EOL
module.exports = {
  apps: [{
    name: 'metal-aloud',
    script: './dist/server/index.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3002
    }
  }]
}
EOL

# Start application
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### 10. Set Permissions

```bash
# Set proper ownership
sudo chown -R www-data:www-data /var/www/metal-aloud

# Set proper permissions
sudo find /var/www/metal-aloud -type d -exec chmod 755 {} \;
sudo find /var/www/metal-aloud -type f -exec chmod 644 {} \;
sudo chmod 400 /var/www/metal-aloud/.env
```

## Security Setup

1. Configure firewall:
```bash
sudo ufw allow 'Nginx Full'
sudo ufw allow OpenSSH
sudo ufw enable
```

2. Install fail2ban:
```bash
sudo apt install fail2ban
sudo systemctl enable fail2ban
sudo systemctl start fail2ban
```

## Monitoring

1. View application logs:
```bash
pm2 logs metal-aloud
```

2. Monitor application:
```bash
pm2 monit
```

3. View web server logs:
```bash
# For Nginx
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/access.log

# For Apache
sudo tail -f /var/log/apache2/error.log
sudo tail -f /var/log/apache2/access.log
```

## Maintenance

### Updates

1. Update application:
```bash
cd /var/www/metal-aloud
git pull
npm install
npm run build
pm2 reload all
```

2. Update system:
```bash
sudo apt update
sudo apt upgrade -y
```

### Backups

1. Create backup script:
```bash
sudo nano /usr/local/bin/backup-metal-aloud.sh
```

Add:
```bash
#!/bin/bash
BACKUP_DIR=/var/backups/metal-aloud
DATE=$(date +%Y%m%d_%H%M%S)

# Create backup directory
mkdir -p $BACKUP_DIR

# Backup application files
tar -czf $BACKUP_DIR/files_$DATE.tar.gz /var/www/metal-aloud

# Rotate old backups (keep last 7 days)
find $BACKUP_DIR -type f -mtime +7 -delete
```

2. Make executable and schedule:
```bash
sudo chmod +x /usr/local/bin/backup-metal-aloud.sh
sudo crontab -e

# Add line:
0 2 * * * /usr/local/bin/backup-metal-aloud.sh
```

## Troubleshooting

### Common Issues

1. Application not starting:
```bash
# Check PM2 logs
pm2 logs

# Check if port is in use
sudo lsof -i :3002
```

2. Web server issues:
```bash
# Check Nginx configuration
sudo nginx -t

# Check Apache configuration
sudo apache2ctl -t
```

3. Permission issues:
```bash
# Reset permissions
sudo chown -R www-data:www-data /var/www/metal-aloud
sudo find /var/www/metal-aloud -type d -exec chmod 755 {} \;
sudo find /var/www/metal-aloud -type f -exec chmod 644 {} \;
```

### Support

For additional support:
- Documentation: https://docs.metalaloud.com
- Email: support@metalaloud.com
- GitHub Issues: https://github.com/yourusername/metal-aloud/issues