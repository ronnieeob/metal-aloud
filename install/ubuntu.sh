#!/bin/bash

# Metal Aloud - Ubuntu Installation Script
set -e

echo "🎸 Starting Metal Aloud installation on Ubuntu..."

# Configuration
APP_NAME="metal-aloud"
APP_PORT=3002  # Changed to avoid conflicts
NODE_VERSION="22"
APP_DIR="/var/www/$APP_NAME"
LOG_DIR="/var/log/$APP_NAME"
APP_PORT=3002  # Changed from 3001 to avoid conflicts

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

# Check for port conflicts
check_ports() {
    log "Checking for port conflicts..."
    local ports=(80 443 3002)  # Changed from 3001 to avoid conflicts
    for port in "${ports[@]}"; do
        if lsof -i ":$port" > /dev/null; then
            log "Port $port is in use, stopping conflicting service..."
            # Try to stop the service using the port
            if [ $port -eq 80 ] || [ $port -eq 443 ]; then
                systemctl stop apache2 2>/dev/null || true
                systemctl stop nginx 2>/dev/null || true
            else
                # Kill process using the port
                pid=$(lsof -t -i:$port)
                if [ ! -z "$pid" ]; then
                    kill -9 $pid
                fi
            fi
        fi
    done
}

# Update system packages
log "📦 Updating system packages..."
apt update && apt upgrade -y || error "Failed to update system packages"

# Install required packages
log "📦 Installing dependencies..."
apt install -y \
    curl \
    wget \
    git \
    build-essential \
    nginx \
    certbot \
    python3-certbot-nginx \
    redis-server \
    ufw \
    fail2ban \
    htop \
    iotop \
    nethogs || error "Failed to install dependencies"

# Install Node.js
log "📦 Installing Node.js $NODE_VERSION..."
curl -fsSL https://deb.nodesource.com/setup_${NODE_VERSION}.x | bash -
apt install -y nodejs || error "Failed to install Node.js"

# Install PM2 globally
log "📦 Installing PM2..."
npm install -g pm2 || error "Failed to install PM2"

# Create directories
log "📂 Creating directories..."
mkdir -p $APP_DIR $LOG_DIR || error "Failed to create directories"

# Clone repository
log "📥 Cloning repository..."
# First try SSH
if ! git clone git@github.com:ronnieeob/metal-aloud.git $APP_DIR; then
    log "SSH clone failed, trying HTTPS..."
    # If SSH fails, try HTTPS with token if provided
    if [ ! -z "$GITHUB_TOKEN" ]; then
        git clone https://oauth2:${GITHUB_TOKEN}@github.com/ronnieeob/metal-aloud.git $APP_DIR || error "Failed to clone repository"
    else
        # If no token, copy files from current directory
        log "No GitHub token provided, copying local files..."
        cp -r . $APP_DIR || error "Failed to copy files"
    fi
fi
cd $APP_DIR || error "Failed to change directory"

# Install dependencies
log "📦 Installing npm dependencies..."
npm ci || error "Failed to install npm dependencies"

# Create environment file
log "🔧 Creating environment file..."
cat > .env << EOL
# Supabase Configuration
VITE_SUPABASE_URL=https://axqwckeauduoyqobzwza.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF4cXdja2VhdWR1b3lxb2J6d3phIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzY1MzExNDIsImV4cCI6MjA1MjEwNzE0Mn0.uOKRyMFHtioPR_9eTPTSzcA4HCy_il8f9UK_8fNqWSw

# Spotify Configuration
VITE_SPOTIFY_CLIENT_ID=ccb639c2b9254c0fb25596a2f6aba562
VITE_SPOTIFY_CLIENT_SECRET=b6ac2a5a3e7441c8b5afcb0707264c44

# Domain Configuration
DOMAIN=$DOMAIN
ADMIN_EMAIL=admin@$DOMAIN
EOL

# Build application
log "🏗️ Building application..."
npm run build || error "Failed to build application"

# Configure Nginx
log "🔧 Configuring Nginx..."
cat > /etc/nginx/sites-available/$APP_NAME << EOL
server {
    listen 80;
    server_name $DOMAIN;
    return 301 https://\$server_name\$request_uri;
}

server {
    listen 443 ssl http2;
    server_name $DOMAIN;

    ssl_certificate /etc/letsencrypt/live/$DOMAIN/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/$DOMAIN/privkey.pem;

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
        proxy_pass http://localhost:$APP_PORT;
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

# Enable site and remove default
ln -sf /etc/nginx/sites-available/$APP_NAME /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Test Nginx configuration
nginx -t || error "Nginx configuration test failed"
systemctl restart nginx || error "Failed to restart Nginx"

# Install SSL certificate
log "🔒 Installing SSL certificate..."
certbot --nginx -d $DOMAIN --non-interactive --agree-tos --email admin@$DOMAIN || error "Failed to install SSL certificate"

# Configure PM2
log "⚙️ Creating PM2 ecosystem file..."
cat > ecosystem.config.cjs << EOL
module.exports = {
  apps: [{
    name: '$APP_NAME',
    script: './dist/server/index.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: $APP_PORT
    },
    error_file: '$LOG_DIR/error.log',
    out_file: '$LOG_DIR/out.log',
    time: true,
    max_memory_restart: '500M',
    restart_delay: 3000,
    wait_ready: true,
    kill_timeout: 5000,
    watch: false
  }]
};
EOL

# Start application with PM2
log "🚀 Starting application..."
pm2 start ecosystem.config.cjs || error "Failed to start application"
pm2 save
pm2 startup

# Configure firewall
log "🔒 Configuring firewall..."
ufw allow 'Nginx Full'
ufw allow OpenSSH
ufw --force enable

# Set proper permissions
log "🔐 Setting permissions..."
chown -R www-data:www-data $APP_DIR
find $APP_DIR -type d -exec chmod 755 {} \;
find $APP_DIR -type f -exec chmod 644 {} \;
chmod 400 $APP_DIR/.env

# Create maintenance script
log "🔧 Creating maintenance script..."
cat > "$APP_DIR/maintenance.sh" << EOL
#!/bin/bash

# Update application
cd $APP_DIR
git pull
npm ci
npm run build
pm2 reload $APP_NAME

# Update system packages
apt update
apt upgrade -y

# Rotate logs
logrotate -f /etc/logrotate.d/$APP_NAME

# Check application status
pm2 status
nginx -t
systemctl status nginx
EOL

chmod +x "$APP_DIR/maintenance.sh"

# Configure log rotation
log "📝 Configuring log rotation..."
cat > "/etc/logrotate.d/$APP_NAME" << EOL
$LOG_DIR/*.log {
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

# Create backup script
log "📦 Creating backup script..."
cat > "/usr/local/bin/backup-$APP_NAME.sh" << EOL
#!/bin/bash
BACKUP_DIR=/var/backups/$APP_NAME
DATE=\$(date +%Y%m%d_%H%M%S)

# Create backup directory
mkdir -p \$BACKUP_DIR

# Backup application files
tar -czf \$BACKUP_DIR/files_\$DATE.tar.gz $APP_DIR

# Rotate old backups (keep last 7 days)
find \$BACKUP_DIR -type f -mtime +7 -delete
EOL

chmod +x "/usr/local/bin/backup-$APP_NAME.sh"

# Schedule backup
(crontab -l 2>/dev/null; echo "0 2 * * * /usr/local/bin/backup-$APP_NAME.sh") | crontab -

# Final success message
echo -e "${GREEN}✨ Installation complete!${NC}"
echo "🌎 Your application is now running at https://$DOMAIN"
echo -e "\nUseful commands:"
echo "- View logs: pm2 logs $APP_NAME"
echo "- Monitor: pm2 monit"
echo "- Restart: pm2 restart $APP_NAME"
echo "- Run backup: /usr/local/bin/backup-$APP_NAME.sh"
echo "- Run maintenance: $APP_DIR/maintenance.sh"
