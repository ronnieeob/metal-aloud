# Metal Aloud - Hostinger Installation Guide

## Server Details
- Site User: hstgr-srv685290
- Domain: srv685290.hstgr.cloud
- Root Directory: /home/hstgr-srv685290/htdocs/srv685290.hstgr.cloud
- App Port: 3001
- Node Version: 22

## Prerequisites

1. Hostinger Business Hosting account
2. SSH access to your server
3. Domain pointed to your server
4. Git repository access

## Quick Installation

1. SSH into your server:
```bash
ssh hstgr-srv685290@srv685290.hstgr.cloud
```

2. Download the installation script:
```bash
wget https://raw.githubusercontent.com/ronnieeob/metal-aloud/main/install.sh
```

3. Make it executable:
```bash
chmod +x install.sh
```

4. Run the installation script:
```bash
sudo ./install.sh
```

## Manual Installation Steps

1. Navigate to root directory:
```bash
cd /home/hstgr-srv685290/htdocs/srv685290.hstgr.cloud
```

2. Install NVM and Node.js:
```bash
# Install NVM
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc

# Install Node.js 22
nvm install 22
nvm use 22
nvm alias default 22
```

3. Clone repository:
```bash
git clone https://github.com/yourusername/metal-aloud.git .
```

4. Install dependencies:
```bash
npm install
```

5. Create environment file:
```bash
cp .env.example .env
```

6. Update environment variables:
```env
# Supabase Configuration
VITE_SUPABASE_URL=https://axqwckeauduoyqobzwza.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF4cXdja2VhdWR1b3lxb2J6d3phIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzY1MzExNDIsImV4cCI6MjA1MjEwNzE0Mn0.uOKRyMFHtioPR_9eTPTSzcA4HCy_il8f9UK_8fNqWSw

# Spotify Configuration
VITE_SPOTIFY_CLIENT_ID=ccb639c2b9254c0fb25596a2f6aba562
VITE_SPOTIFY_CLIENT_SECRET=b6ac2a5a3e7441c8b5afcb0707264c44

# Domain Configuration
DOMAIN=srv685290.hstgr.cloud
ADMIN_EMAIL=admin@srv685290.hstgr.cloud
```

7. Build application:
```bash
npm run build
```

## Process Management

1. Install PM2:
```bash
npm install -g pm2
```

2. Create PM2 ecosystem file:
```bash
cat > ecosystem.config.cjs << EOL
module.exports = {
  apps: [{
    name: 'srv685290-metal',
    script: 'dist/server/index.js',
    instances: 1,
    exec_mode: 'fork',
    env: {
      NODE_ENV: 'production',
      PORT: 3001
    }
  }]
};
EOL
```

3. Start application:
```bash
pm2 start ecosystem.config.cjs
pm2 save
pm2 startup
```

## Apache Configuration

1. Create .htaccess file:
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
```

## Security Setup

1. Set proper file permissions:
```bash
find /home/hstgr-srv685290/htdocs/srv685290.hstgr.cloud -type d -exec chmod 755 {} \;
find /home/hstgr-srv685290/htdocs/srv685290.hstgr.cloud -type f -exec chmod 644 {} \;
chmod 400 .env
```

## Monitoring

1. Monitor application:
```bash
pm2 monit
```

2. View logs:
```bash
pm2 logs srv685290-metal
```

## Maintenance

1. Update application:
```bash
cd /home/hstgr-srv685290/htdocs/srv685290.hstgr.cloud
git pull
npm install
npm run build
pm2 restart srv685290-metal
```

2. View logs:
```bash
# Application logs
tail -f /home/hstgr-srv685290/logs/srv685290-metal-error.log
tail -f /home/hstgr-srv685290/logs/srv685290-metal-out.log

# Apache access logs
tail -f /var/log/apache2/access.log

# Apache error logs
tail -f /var/log/apache2/error.log
```

3. Restart services:
```bash
# Restart application
pm2 restart srv685290-metal

# Restart Apache
sudo systemctl restart apache2
```

## Support

For additional support:
- Check documentation
- Contact support@metalaloud.com
- Submit issues on GitHub