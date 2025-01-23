# Metal Aloud - Installation Guide

## Hostinger VPS Requirements

- Ubuntu 20.04 or higher
- Node.js 18+ and npm
- PHP 8.1 or higher
- MySQL 8.0 or higher
- Nginx
- Domain name pointed to your VPS

## Quick Deploy

1. SSH into your Hostinger VPS
2. Clone the repository
3. Copy `.env.example` to `.env` and update the values
4. Update domain in `nginx.conf` and `deploy.sh`
5. Run the deployment script:
   ```bash
   chmod +x deploy.sh
   sudo ./deploy.sh
   ```

## Manual Installation
- Required PHP extensions:
  - PDO
  - pdo_mysql
  - json
  - openssl

## Installation Steps

1. Upload all files to your web hosting directory
2. Navigate to `install.php` in your web browser
3. Fill in the required information:
   - License key
   - Application name
   - Application URL
   - Database credentials

## Post-Installation

1. Delete `install.php` for security
2. Set up your cron jobs if required
3. Configure your web server (sample configs below)

### Apache Configuration (.htaccess)
```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>
```

### Nginx Configuration
```nginx
location / {
  try_files $uri $uri/ /index.html;
}
```

## Support

For support, please contact:
- Email: support@metalaloud.com
- Website: https://metalaloud.com/support