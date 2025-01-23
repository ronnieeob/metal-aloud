# Metal Aloud - Hostinger Deployment Guide

## Prerequisites
1. Hostinger VPS with Ubuntu
2. SSH access to your server
3. Domain pointed to your server
4. MySQL database created in Hostinger panel

## Step 1: Initial Server Setup

1. SSH into your server:
```bash
ssh username@your-server-ip
```

2. Update system packages:
```bash
sudo apt update && sudo apt upgrade -y
```

3. Install required packages:
```bash
sudo apt install -y nginx mysql-client php8.1-fpm php8.1-mysql \
  nodejs npm certbot python3-certbot-nginx git
```

4. Install PM2 globally:
```bash
sudo npm install -g pm2
```

## Step 2: Configure MySQL

1. Create database and user:
```bash
mysql -h localhost -u root -p
```

```sql
CREATE DATABASE metal_aloud;
CREATE USER 'metal_aloud'@'localhost' IDENTIFIED BY 'your_password';
GRANT ALL PRIVILEGES ON metal_aloud.* TO 'metal_aloud'@'localhost';
FLUSH PRIVILEGES;
exit;
```

2. Import database schema:
```bash
mysql -u metal_aloud -p metal_aloud < database/schema.sql
```

## Step 3: Configure Nginx

1. Create Nginx configuration:
```bash
sudo nano /etc/nginx/sites-available/metal-aloud
```

Add:
```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /var/www/metal-aloud;
    index index.html;

    # API proxy
    location /api {
        proxy_pass http://localhost:3001;
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

2. Enable the site:
```bash
sudo ln -s /etc/nginx/sites-available/metal-aloud /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl restart nginx
```

## Step 4: Deploy Application

1. Clone repository:
```bash
cd /var/www
sudo git clone https://github.com/yourusername/metal-aloud.git
cd metal-aloud
```

2. Install dependencies:
```bash
npm install
```

3. Create environment file:
```bash
cp .env.example .env
```

4. Update environment variables:
```env
DB_HOST=localhost
DB_USER=metal_aloud
DB_PASSWORD=your_password
DB_NAME=metal_aloud
DB_PORT=3306
```

5. Build application:
```bash
npm run build
```

6. Set up PM2:
```bash
pm2 start npm --name "metal-aloud" -- start
pm2 save
pm2 startup
```

## Step 5: SSL Setup

1. Install SSL certificate:
```bash
sudo certbot --nginx -d your-domain.com
```

## Step 6: File Permissions

1. Set proper permissions:
```bash
sudo chown -R www-data:www-data /var/www/metal-aloud
find /var/www/metal-aloud -type d -exec chmod 755 {} \;
find /var/www/metal-aloud -type f -exec chmod 644 {} \;
chmod 400 .env
```

## Step 7: Security Setup

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

## Step 8: Monitoring Setup

1. Set up PM2 monitoring:
```bash
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
```

## Step 9: Backup Setup

1. Create backup script:
```bash
sudo nano /root/backup-metal-aloud.sh
```

Add:
```bash
#!/bin/bash
BACKUP_DIR=/var/backups/metal-aloud
DATE=$(date +%Y%m%d)

# Create backup directory
mkdir -p $BACKUP_DIR

# Backup database
mysqldump -u metal_aloud -p metal_aloud > $BACKUP_DIR/db_$DATE.sql

# Backup files
tar -czf $BACKUP_DIR/files_$DATE.tar.gz /var/www/metal-aloud

# Keep only last 7 days
find $BACKUP_DIR -type f -mtime +7 -delete
```

2. Make executable and schedule:
```bash
chmod +x /root/backup-metal-aloud.sh
crontab -e
```

Add:
```
0 2 * * * /root/backup-metal-aloud.sh
```

## Maintenance

1. Update application:
```bash
cd /var/www/metal-aloud
git pull
npm install
npm run build
pm2 restart metal-aloud
```

2. Monitor logs:
```bash
pm2 logs
sudo tail -f /var/log/nginx/error.log
```

3. Database maintenance:
```bash
mysql -u metal_aloud -p metal_aloud
ANALYZE TABLE users, songs, products, orders;
OPTIMIZE TABLE users, songs, products, orders;
```

## Support
For additional support:
- Check documentation
- Contact support@metalaloud.com