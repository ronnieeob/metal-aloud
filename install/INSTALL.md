# Metal Aloud - Ubuntu Installation Guide

## System Requirements

- Ubuntu 20.04 LTS or higher
- Minimum 2GB RAM
- 20GB free disk space
- Root access or sudo privileges

## Prerequisites

1. Check for running services:
```bash
sudo lsof -i :80
sudo lsof -i :443
sudo lsof -i :3002
```

2. Stop conflicting services if needed:
```bash
sudo systemctl stop apache2    # If Apache is running
sudo systemctl stop nginx      # If Nginx is running
```

3. Update system packages:
```bash
sudo apt update && sudo apt upgrade -y
```

4. Install required system packages:
```bash
sudo apt install -y curl wget git build-essential
```

## Quick Installation

1. Download the installation script:
```bash
wget https://raw.githubusercontent.com/ronnieeob/metal-aloud/main/install/install.sh
```

2. Make it executable:
```bash
chmod +x install.sh
```

3. Run the installation:
```bash
sudo ./install.sh
```

## Manual Installation Steps

If you prefer to install manually, follow these steps:

1. Install Node.js 22:
```bash
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt install -y nodejs
```

2. Install Nginx:
```bash
sudo apt install -y nginx

# Configure Nginx
sudo cp nginx.conf /etc/nginx/sites-available/metal-aloud
sudo ln -s /etc/nginx/sites-available/metal-aloud /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default
sudo nginx -t && sudo systemctl restart nginx
```

3. Install PM2:
```bash
sudo npm install -g pm2
```

4. Clone repository:
```bash
git clone https://github.com/ronnieeob/metal-aloud.git /var/www/metal-aloud
cd /var/www/metal-aloud
```

5. Install dependencies:
```bash
npm install
```

6. Build application:
```bash
npm run build
```

7. Configure environment:
```bash
cp .env.example .env
# Edit .env with your settings
```

8. Start application:
```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

## SSL Configuration

1. Install Certbot:
```bash
sudo apt install -y certbot python3-certbot-nginx
```

2. Obtain SSL certificate:
```bash
sudo certbot --nginx -d yourdomain.com
```

## Security Setup

1. Configure firewall:
```bash
sudo ufw allow 'Nginx Full'
sudo ufw allow OpenSSH
sudo ufw enable
```

2. Set proper permissions:
```bash
sudo chown -R www-data:www-data /var/www/metal-aloud
sudo find /var/www/metal-aloud -type d -exec chmod 755 {} \;
sudo find /var/www/metal-aloud -type f -exec chmod 644 {} \;
sudo chmod 400 /var/www/metal-aloud/.env
```

## Monitoring Setup

1. Install monitoring tools:
```bash
sudo apt install -y htop iotop nethogs
```

2. Configure PM2 monitoring:
```bash
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
```

## Backup Configuration

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
```

Add:
```
0 2 * * * /usr/local/bin/backup-metal-aloud.sh
```

## Maintenance

1. Update application:
```bash
cd /var/www/metal-aloud
git pull
npm install
npm run build
pm2 reload all
```

2. View logs:
```bash
# Application logs
pm2 logs

# Nginx access logs
sudo tail -f /var/log/nginx/access.log

# Nginx error logs
sudo tail -f /var/log/nginx/error.log
```

3. Monitor system:
```bash
htop
pm2 monit
```

## Troubleshooting

1. Port conflicts:
```bash
# Check for processes using ports
sudo lsof -i :80
sudo lsof -i :443
sudo lsof -i :3002

# Stop conflicting services
sudo systemctl stop apache2
sudo systemctl stop nginx
```

2. Permission issues:
```bash
# Reset permissions
sudo chown -R www-data:www-data /var/www/metal-aloud
sudo find /var/www/metal-aloud -type d -exec chmod 755 {} \;
sudo find /var/www/metal-aloud -type f -exec chmod 644 {} \;
```

3. Service issues:
```bash
# Check service status
sudo systemctl status nginx
pm2 status

# Restart services
sudo systemctl restart nginx
pm2 restart all
```

## Support

For additional support:
- Check documentation
- Contact support@metalaloud.com
- Submit issues on GitHub