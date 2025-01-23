#!/bin/bash

# Metal Aloud - Ubuntu Deployment Script
set -e

echo "🎸 Starting Metal Aloud deployment on Ubuntu..."

# Configuration
APP_NAME="metal-aloud"
DOMAIN="srv685290.hstgr.cloud"
NODE_VERSION="22"
APP_DIR="/var/www"
LOG_DIR="/var/log/metal-aloud"
APP_PORT=3001

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

# Function to check command status
check_command() {
    if [ $? -ne 0 ]; then
        error "$1"
    fi
}

# Create necessary directories
log "📂 Creating directories..."
mkdir -p $APP_DIR $LOG_DIR
chmod 755 $APP_DIR $LOG_DIR

# Navigate to app directory
cd $APP_DIR || error "Failed to change to app directory"

# Clone repository if not exists
if [ ! -d "$APP_DIR/metal-aloud" ]; then
  git clone https://github.com/ronnieeob/dima.git metal-aloud
fi
cd metal-aloud

# Install Node.js
log "🔧 Setting up Node.js environment..."
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
nvm install $NODE_VERSION
nvm use $NODE_VERSION
nvm alias default $NODE_VERSION

# Create/update environment file
log "🔧 Configuring environment..."
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
chmod 644 .env

# Install dependencies and build
log "🏗️ Building application..."
npm ci
npm run build
check_command "Build failed"

# Install PM2 globally
log "📦 Installing PM2..."
npm install -g pm2
check_command "Failed to install PM2"

# Create PM2 ecosystem file
log "⚙️ Creating PM2 ecosystem file..."
cat > ecosystem.config.cjs << EOL
module.exports = {
  apps: [{
    name: "srv685290-metal",
    script: "./dist/server/index.js",
    instances: 1,
    exec_mode: "fork",
    cwd: "$APP_DIR",
    env: {
      NODE_ENV: "production",
      PORT: $APP_PORT,
      DOMAIN: "$DOMAIN",
      ADMIN_EMAIL: "admin@$DOMAIN",
      VITE_SUPABASE_URL: "https://axqwckeauduoyqobzwza.supabase.co",
      VITE_SUPABASE_ANON_KEY: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF4cXdja2VhdWR1b3lxb2J6d3phIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzY1MzExNDIsImV4cCI6MjA1MjEwNzE0Mn0.uOKRyMFHtioPR_9eTPTSzcA4HCy_il8f9UK_8fNqWSw",
      VITE_SPOTIFY_CLIENT_ID: "ccb639c2b9254c0fb25596a2f6aba562",
      VITE_SPOTIFY_CLIENT_SECRET: "b6ac2a5a3e7441c8b5afcb0707264c44"
    },
    error_file: "$LOG_DIR/error.log",
    out_file: "$LOG_DIR/out.log",
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
log "🔧 Configuring Apache..."
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

# Set proper permissions
log "🔐 Setting permissions..."
find . -type d -exec chmod 755 {} \;
find . -type f -exec chmod 644 {} \;
chmod 600 .env

# Start/Restart PM2
log "🚀 Starting application..."
pm2 delete srv685290-metal || true
pm2 start ecosystem.config.cjs
pm2 save

# Create maintenance script
log "🔧 Creating maintenance script..."
cat > "$APP_DIR/maintenance.sh" << EOL
#!/bin/bash

# Update application
cd $APP_DIR
git pull
npm ci
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

chmod +x "$APP_DIR/maintenance.sh"
chown root:root "$APP_DIR/maintenance.sh"

# Set up automatic updates
log "🔄 Configuring automatic updates..."
apt install -y unattended-upgrades
dpkg-reconfigure -plow unattended-upgrades

echo -e "${GREEN}✨ Deployment complete!${NC}"
echo "🌎 Your application is now running at https://$DOMAIN"
echo -e "\nUseful commands:"
echo "- View logs: pm2 logs srv685290-metal"
echo "- Monitor: pm2 monit"
echo "- Restart: pm2 restart srv685290-metal"
echo "- Run maintenance: ./maintenance.sh"