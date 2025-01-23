#!/bin/bash

# Metal Aloud Installation Script
set -e

echo "🎸 Installing Metal Aloud..."

# Configuration
ROOT_DIR="/home/hstgr-srv685290/htdocs/srv685290.hstgr.cloud"
APP_PORT=3002  # Changed from 3001 to avoid conflicts
USER="hstgr-srv685290"
DOMAIN="srv685290.hstgr.cloud"
LOG_DIR="/home/hstgr-srv685290/logs"
WEB_SERVER="apache" # or "nginx"

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

# Function to check and handle port conflicts
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

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    error "Please run as root"
fi

# Check for port conflicts before starting installation
check_ports

# Update system packages
echo "📦 Updating system packages..."
apt update && apt upgrade -y

# Function to detect web server
detect_web_server() {
    if command -v apache2 >/dev/null 2>&1; then
        WEB_SERVER="apache"
    elif command -v nginx >/dev/null 2>&1; then
        WEB_SERVER="nginx"
    else
        error "No supported web server found"
    fi
}

# Function to configure Apache
configure_apache() {
    echo "🔧 Configuring Apache..."
    # Create .htaccess file
    cat > .htaccess << EOL
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
  Header set Content-Security-Policy "default-src 'self' https: data: 'unsafe-inline' 'unsafe-eval';"
</IfModule>

# Enable compression
<IfModule mod_deflate.c>
  AddOutputFilterByType DEFLATE text/plain text/html text/xml text/css application/xml application/xhtml+xml application/rss+xml application/javascript application/x-javascript
</IfModule>

# Cache control
<IfModule mod_expires.c>
  ExpiresActive On
  ExpiresByType image/jpg "access plus 1 year"
  ExpiresByType image/jpeg "access plus 1 year"
  ExpiresByType image/gif "access plus 1 year"
  ExpiresByType image/png "access plus 1 year"
  ExpiresByType text/css "access plus 1 month"
  ExpiresByType application/javascript "access plus 1 month"
</IfModule>

# Protect sensitive files
<FilesMatch "^\.env|config\.json|composer\.json|package\.json|package-lock\.json">
  Order allow,deny
  Deny from all
</FilesMatch>

# Disable directory listing
Options -Indexes
EOL
    check_command "Failed to create .htaccess"

    # Enable required Apache modules
    a2enmod rewrite headers expires deflate
    systemctl restart apache2
}

# Function to configure Nginx
configure_nginx() {
    echo "🔧 Configuring Nginx..."
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

    ln -sf /etc/nginx/sites-available/$APP_NAME /etc/nginx/sites-enabled/
    rm -f /etc/nginx/sites-enabled/default
    nginx -t
    systemctl restart nginx
}

# Main installation process
main() {
    # Check ports and stop conflicting services
    check_ports

    # Detect web server
    detect_web_server

    # Create directories and set permissions
    mkdir -p $ROOT_DIR $LOG_DIR
    chown -R $USER:$USER $ROOT_DIR $LOG_DIR

    # Setup Node.js
    curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
    export NVM_DIR="$HOME/.nvm"
    [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
    nvm install $NODE_VERSION
    nvm use $NODE_VERSION
    nvm alias default $NODE_VERSION

    # Install PM2
    npm install -g pm2

    # Clone repository and install dependencies
    cd $ROOT_DIR
    git clone https://github.com/ronnieeob/metal-aloud.git .
    npm ci

    # Create environment file
    cp .env.example .env
    # Update environment variables...

    # Build application
    npm run build

    # Configure web server
    if [ "$WEB_SERVER" = "apache" ]; then
        configure_apache
    else
        configure_nginx
    fi

    # Start application
    pm2 start ecosystem.config.cjs
    pm2 save
    pm2 startup

    # Set permissions
    find $ROOT_DIR -type d -exec chmod 755 {} \;
    find $ROOT_DIR -type f -exec chmod 644 {} \;
    chmod 400 $ROOT_DIR/.env

    echo -e "${GREEN}✨ Installation complete!${NC}"
    echo "🌎 Your application is now running at https://$DOMAIN"
}

# Run installation
main