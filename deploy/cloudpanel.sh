#!/bin/bash

# Metal Aloud - CloudPanel Deployment Script
set -e

echo "🎸 Starting Metal Aloud deployment on CloudPanel..."

# Configuration
APP_NAME="metal-aloud"
DOMAIN="your-domain.com" # Replace with your domain
NODE_VERSION="18"
APP_DIR="/home/cloudpanel/htdocs/$DOMAIN"
LOG_DIR="/home/cloudpanel/logs/$APP_NAME"
ENV_FILE="$APP_DIR/.env"
NGINX_CONF="/etc/nginx/sites-available/$DOMAIN"

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

# Function to log messages
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERROR: $1${NC}"
    exit 1
}

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    error "Please run as root"
fi

# Create necessary directories
log "📂 Creating directories..."
mkdir -p $APP_DIR
mkdir -p $LOG_DIR
chown -R cloudpanel:cloudpanel $APP_DIR $LOG_DIR

# Update system packages
log "📦 Updating system packages..."
apt update && apt upgrade -y

# Install required packages
log "📦 Installing dependencies..."
apt install -y \
    curl \
    git \
    build-essential \
    python3 \
    python3-pip \
    nginx \
    certbot \
    python3-certbot-nginx \
    redis-server \
    imagemagick \
    ffmpeg

# Install Node.js if not present
if ! command -v node &> /dev/null; then
    log "📦 Installing Node.js $NODE_VERSION..."
    curl -fsSL https://deb.nodesource.com/setup_${NODE_VERSION}.x | bash -
    apt install -y nodejs
fi

# Install PM2 globally
log "📦 Installing PM2..."
npm install -g pm2

# Create PM2 ecosystem file
log "⚙️ Creating PM2 ecosystem file..."
cat > "$APP_DIR/ecosystem.config.js" << EOL
module.exports = {
  apps: [{
    name: '$APP_NAME',
    script: 'dist/server/index.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: '$LOG_DIR/error.log',
    out_file: '$LOG_DIR/out.log',
    time: true
  }]
};
EOL

# Create Nginx configuration
log "🔧 Configuring Nginx..."
cat > "$NGINX_CONF" << EOL
server {
    listen 80;
    listen [::]:80;
    server_name $DOMAIN www.$DOMAIN;

    # Redirect HTTP to HTTPS
    return 301 https://\$server_name\$request_uri;
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name $DOMAIN www.$DOMAIN;

    root $APP_DIR/dist;
    index index.html;

    # SSL configuration
    ssl_certificate /etc/letsencrypt/live/$DOMAIN/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/$DOMAIN/privkey.pem;
    ssl_session_timeout 1d;
    ssl_session_cache shared:SSL:50m;
    ssl_session_tickets off;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-CHACHA20-POLY1305:ECDHE-RSA-CHACHA20-POLY1305:DHE-RSA-AES128-GCM-SHA256:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;

    # HSTS
    add_header Strict-Transport-Security "max-age=63072000" always;

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
        proxy_pass http://localhost:3000;
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
EOL

# Configure rate limiting in Nginx
cat >> /etc/nginx/nginx.conf << EOL
# Rate limiting zones
limit_req_zone \$binary_remote_addr zone=api:10m rate=10r/s;
EOL

# Install SSL certificate
log "🔒 Installing SSL certificate..."
certbot --nginx -d $DOMAIN -d www.$DOMAIN --non-interactive --agree-tos --email admin@$DOMAIN

# Clone repository and install dependencies
log "📥 Setting up application..."
cd $APP_DIR
git clone https://github.com/yourusername/metal-aloud.git .
npm install

# Build application
log "🏗️ Building application..."
npm run build

# Start application with PM2
log "🚀 Starting application..."
pm2 start ecosystem.config.js
pm2 save
pm2 startup

# Set up automatic deployment
log "🔄 Setting up automatic deployment..."
cat > "$APP_DIR/deploy.sh" << EOL
#!/bin/bash
cd $APP_DIR
git pull
npm install
npm run build
pm2 reload $APP_NAME
EOL

chmod +x "$APP_DIR/deploy.sh"

# Set up log rotation
log "📝 Configuring log rotation..."
cat > "/etc/logrotate.d/$APP_NAME" << EOL
$LOG_DIR/*.log {
    daily
    rotate 14
    compress
    delaycompress
    notifempty
    create 0640 cloudpanel cloudpanel
    sharedscripts
    postrotate
        [ -f /var/run/nginx.pid ] && kill -USR1 \$(cat /var/run/nginx.pid)
    endscript
}
EOL

# Set up automatic updates
log "🔄 Configuring automatic updates..."
apt install -y unattended-upgrades
dpkg-reconfigure -plow unattended-upgrades

# Set up firewall
log "🔒 Configuring firewall..."
ufw allow 'Nginx Full'
ufw allow OpenSSH
ufw --force enable

# Set proper permissions
log "🔐 Setting permissions..."
chown -R cloudpanel:cloudpanel $APP_DIR
find $APP_DIR -type d -exec chmod 755 {} \;
find $APP_DIR -type f -exec chmod 644 {} \;
chmod 400 $ENV_FILE

# Create maintenance script
log "🔧 Creating maintenance script..."
cat > "$APP_DIR/maintenance.sh" << EOL
#!/bin/bash

# Update application
cd $APP_DIR
git pull
npm install
npm run build
pm2 reload $APP_NAME

# Update system packages
apt update
apt upgrade -y

# Rotate logs
logrotate -f /etc/logrotate.d/$APP_NAME

# Check SSL certificate
certbot renew --dry-run

# Check application status
pm2 status
nginx -t
systemctl status nginx
EOL

chmod +x "$APP_DIR/maintenance.sh"

# Final steps
log "✨ Deployment complete!"
echo -e "\n${GREEN}Metal Aloud has been successfully deployed!${NC}"
echo -e "\nNext steps:"
echo "1. Update the .env file with your environment variables"
echo "2. Configure your domain DNS to point to this server"
echo "3. Test the application at https://$DOMAIN"
echo -e "\nMaintenance commands:"
echo "- View logs: pm2 logs $APP_NAME"
echo "- Monitor: pm2 monit"
echo "- Update: $APP_DIR/deploy.sh"
echo "- Maintenance: $APP_DIR/maintenance.sh"