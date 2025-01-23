#!/bin/bash

# Metal Aloud Deployment Script for Hostinger
set -e

echo "🎸 Deploying Metal Aloud to Hostinger..."

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

# Function to install Node.js
setup_node() {
    echo "📦 Setting up Node.js 22..."
    if [ ! -d "$HOME/.nvm" ]; then
        # Install NVM
        curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
        export NVM_DIR="$HOME/.nvm"
        [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
    fi
    
    # Install and use Node.js 22
    . $HOME/.nvm/nvm.sh
    nvm install 22
    nvm use 22
    nvm alias default 22
    
    # Verify installation
    node --version
    npm --version
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

# Setup Node.js environment
echo "🔧 Setting up Node.js environment..."
sudo -u $USER bash -c "$(declare -f setup_node); setup_node"
check_command "Failed to setup Node.js"

# Install PM2 globally
echo "📦 Installing PM2..."
sudo -u $USER bash -c "source ~/.nvm/nvm.sh && npm install -g pm2"
check_command "Failed to install PM2"

# Install dependencies
echo "📦 Installing dependencies..."
sudo -u $USER bash -c "source ~/.nvm/nvm.sh && npm ci"
check_command "npm install failed"

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

# Build application
echo "🏗️ Building application..."
sudo -u $USER bash -c "source ~/.nvm/nvm.sh && npm run build"
check_command "Build failed"

# Create PM2 ecosystem file
echo "⚙️ Creating PM2 ecosystem file..."
cat > ecosystem.config.cjs << EOL
module.exports = {
  apps: [{
    name: "srv685290-metal",
    script: "./dist/server/index.js",
    instances: 1,
    exec_mode: "fork",
    cwd: "${ROOT_DIR}",
    env: {
      NODE_ENV: "production",
      PORT: ${APP_PORT},
      DOMAIN: "${DOMAIN}",
      ADMIN_EMAIL: "admin@${DOMAIN}",
      VITE_SUPABASE_URL: "https://axqwckeauduoyqobzwza.supabase.co",
      VITE_SUPABASE_ANON_KEY: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF4cXdja2VhdWR1b3lxb2J6d3phIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzY1MzExNDIsImV4cCI6MjA1MjEwNzE0Mn0.uOKRyMFHtioPR_9eTPTSzcA4HCy_il8f9UK_8fNqWSw",
      VITE_SPOTIFY_CLIENT_ID: "ccb639c2b9254c0fb25596a2f6aba562",
      VITE_SPOTIFY_CLIENT_SECRET: "b6ac2a5a3e7441c8b5afcb0707264c44"
    },
    error_file: "${LOG_DIR}/srv685290-metal-error.log",
    out_file: "${LOG_DIR}/srv685290-metal-out.log",
    time: true,
    max_memory_restart: "500M",
    restart_delay: 3000,
    wait_ready: true,
    kill_timeout: 5000,
    watch: false
  }]
};
EOL
check_command "Failed to create PM2 ecosystem file"

# Create Apache configuration
echo "🔧 Configuring Apache..."
cat > .htaccess << EOL
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule ^(.*)$ /index.html [L]
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

# Set proper permissions
echo "🔐 Setting permissions..."
find $ROOT_DIR -type d -exec chmod 755 {} \;
find $ROOT_DIR -type f -exec chmod 644 {} \;
chmod 600 $ROOT_DIR/.env

# Start/Restart PM2
echo "🚀 Starting application..."
cd $ROOT_DIR
sudo -u $USER bash -c "source ~/.nvm/nvm.sh && pm2 delete srv685290-metal || true && pm2 start ecosystem.config.cjs"
sudo -u $USER bash -c "source ~/.nvm/nvm.sh && pm2 save"

# Create maintenance script
echo "🔧 Creating maintenance script..."
cat > "$ROOT_DIR/maintenance.sh" << EOL
#!/bin/bash

# Update application
cd $ROOT_DIR
git pull
source ~/.nvm/nvm.sh
nvm use 22
npm install
npm run build
pm2 reload srv685290-metal

# Update system packages
apt update
apt upgrade -y

# Rotate logs
logrotate -f /etc/logrotate.d/srv685290-metal

# Check application status
pm2 status
EOL

chmod +x "$ROOT_DIR/maintenance.sh"
chown $USER:$USER "$ROOT_DIR/maintenance.sh"

# Create log rotation configuration
echo "📝 Configuring log rotation..."
cat > "/etc/logrotate.d/srv685290-metal" << EOL
$LOG_DIR/*.log {
    daily
    rotate 14
    compress
    delaycompress
    notifempty
    create 0640 $USER $USER
    sharedscripts
    postrotate
        [ ! -f /var/run/nginx.pid ] || kill -USR1 \$(cat /var/run/nginx.pid)
    endscript
}
EOL

echo -e "${GREEN}✨ Deployment complete!${NC}"
echo "🌎 Your application is now running at https://$DOMAIN"
echo -e "\nUseful commands:"
echo "- View logs: pm2 logs srv685290-metal"
echo "- Monitor: pm2 monit"
echo "- Restart: pm2 restart srv685290-metal"
echo "- Run maintenance: ./maintenance.sh"