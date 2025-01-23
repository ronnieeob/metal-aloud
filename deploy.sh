#!/bin/bash

# Metal Aloud Deployment Script for Hostinger Business Hosting
set -e

echo "🎸 Deploying Metal Aloud..."

# Configuration
ROOT_DIR="/home/hstgr-srv685290/htdocs/srv685290.hstgr.cloud"
APP_PORT=3001
USER="hstgr-srv685290"
DOMAIN="srv685290.hstgr.cloud"
LOG_DIR="/home/hstgr-srv685290/logs"

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

# Create necessary directories
echo "📂 Creating directories..."
mkdir -p $ROOT_DIR $LOG_DIR
check_command "Failed to create directories"

# Set proper ownership
chown -R $USER:$USER $ROOT_DIR $LOG_DIR
check_command "Failed to set ownership"

# Navigate to app directory
cd $ROOT_DIR || error "Failed to change to app directory"

# Create/update environment file
echo "🔧 Configuring environment..."
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
check_command "Failed to create .env file"

# Set proper permissions for .env
chmod 600 .env
chown $USER:$USER .env

# Create Nginx configuration
echo "🔧 Configuring Nginx..."
cat > nginx.conf << EOL
server {
    listen 80;
    listen [::]:80;
    server_name $DOMAIN;

    # Redirect HTTP to HTTPS
    return 301 https://\$server_name\$request_uri;
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name $DOMAIN;

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

    root $ROOT_DIR/dist;
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
check_command "Failed to create Nginx configuration"

# Set proper permissions
echo "🔐 Setting permissions..."
find $ROOT_DIR -type d -exec chmod 755 {} \;
find $ROOT_DIR -type f -exec chmod 644 {} \;
chmod 600 $ROOT_DIR/.env

echo -e "${GREEN}✨ Deployment complete!${NC}"
echo "🌎 Your application is now running at https://$DOMAIN"
echo -e "\nNext steps:"
echo "1. Copy nginx.conf to /etc/nginx/sites-available/$DOMAIN"
echo "2. Create symbolic link: ln -s /etc/nginx/sites-available/$DOMAIN /etc/nginx/sites-enabled/"
echo "3. Test Nginx configuration: nginx -t"
echo "4. Reload Nginx: systemctl reload nginx"
echo "5. Install SSL certificate: certbot --nginx -d $DOMAIN"