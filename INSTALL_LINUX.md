# Metal Aloud - Secure Linux Installation Guide

## System Requirements

- Ubuntu 20.04 LTS or higher
- Node.js 18+
- PostgreSQL 14+
- Nginx
- UFW (Uncomplicated Firewall)
- Let's Encrypt SSL
- Fail2ban

## Pre-Installation Security Setup

1. Update system packages:
```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y curl wget gnupg2 software-properties-common
```

2. Configure firewall:
```bash
sudo apt install ufw
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'
sudo ufw enable
```

3. Install fail2ban:
```bash
sudo apt install fail2ban
sudo systemctl enable fail2ban
sudo systemctl start fail2ban
```

4. Create secure user:
```bash
sudo adduser metal_aloud
sudo usermod -aG sudo metal_aloud
sudo su - metal_aloud
```

## Installation Steps

1. Install Node.js:
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs
```

2. Install PostgreSQL:
```bash
sudo apt install postgresql postgresql-contrib
```

3. Configure PostgreSQL:
```bash
sudo -u postgres psql
postgres=# CREATE USER metal_aloud WITH PASSWORD 'strong_password';
postgres=# CREATE DATABASE metal_aloud;
postgres=# GRANT ALL PRIVILEGES ON DATABASE metal_aloud TO metal_aloud;
postgres=# \q

# Secure PostgreSQL
sudo nano /etc/postgresql/14/main/pg_hba.conf
# Set authentication to md5 and restrict access
```

4. Install Nginx:
```bash
sudo apt install nginx
```

5. Clone repository:
```bash
cd /var/www
sudo git clone https://github.com/yourusername/metal-aloud.git
sudo chown -R metal_aloud:metal_aloud metal-aloud
cd metal-aloud
```

6. Install dependencies:
```bash
npm install
```

7. Set up environment:
```bash
cp .env.example .env
# Edit .env with secure values
nano .env
```

8. Configure secure file permissions:
```bash
find /var/www/metal-aloud -type f -exec chmod 644 {} \;
find /var/www/metal-aloud -type d -exec chmod 755 {} \;
chmod 400 .env
```

## SSL Configuration

1. Install Certbot:
```bash
sudo apt install certbot python3-certbot-nginx
```

2. Obtain SSL certificate:
```bash
sudo certbot --nginx -d yourdomain.com
```

## Nginx Configuration

1. Create Nginx config:
```bash
sudo nano /etc/nginx/sites-available/metal-aloud
```

2. Add secure configuration:
```nginx
server {
    listen 443 ssl http2;
    server_name yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    ssl_session_timeout 1d;
    ssl_session_cache shared:SSL:50m;
    ssl_session_tickets off;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-CHACHA20-POLY1305:ECDHE-RSA-CHACHA20-POLY1305:DHE-RSA-AES128-GCM-SHA256:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;

    # HSTS
    add_header Strict-Transport-Security "max-age=63072000" always;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Content-Security-Policy "default-src 'self' https:; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' https: data:; font-src 'self' https: data:;" always;

    root /var/www/metal-aloud/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
        expires 30d;
        add_header Cache-Control "public, no-transform";
    }

    # API proxy with rate limiting
    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        
        limit_req zone=api burst=20 nodelay;
        limit_req_status 429;
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
limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
```

3. Enable configuration:
```bash
sudo ln -s /etc/nginx/sites-available/metal-aloud /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

## Process Management

1. Install PM2:
```bash
sudo npm install -g pm2
```

2. Create ecosystem file:
```bash
nano ecosystem.config.js
```

Add:
```javascript
module.exports = {
  apps: [{
    name: 'metal-aloud',
    script: 'dist/server/index.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3001
    },
    env_production: {
      NODE_ENV: 'production'
    }
  }]
}
```

3. Start application:
```bash
npm run build
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

## Security Hardening

1. Configure fail2ban:
```bash
sudo nano /etc/fail2ban/jail.local
```

Add:
```ini
[DEFAULT]
bantime = 1h
findtime = 10m
maxretry = 5

[nginx-req-limit]
enabled = true
filter = nginx-req-limit
action = iptables-multiport[name=ReqLimit, port="http,https"]
logpath = /var/log/nginx/error.log
findtime = 600
maxretry = 10
bantime = 7200
```

2. Set up logrotate:
```bash
sudo nano /etc/logrotate.d/metal-aloud
```

Add:
```
/var/log/metal-aloud/*.log {
    daily
    rotate 14
    compress
    delaycompress
    notifempty
    create 0640 metal_aloud metal_aloud
    sharedscripts
    postrotate
        [ -f /var/run/nginx.pid ] && kill -USR1 $(cat /var/run/nginx.pid)
    endscript
}
```

3. Configure automatic updates:
```bash
sudo apt install unattended-upgrades
sudo dpkg-reconfigure --priority=low unattended-upgrades
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
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR=/var/backups/metal-aloud

# Create backup directory
mkdir -p $BACKUP_DIR

# Backup database
pg_dump metal_aloud > $BACKUP_DIR/db_$TIMESTAMP.sql

# Backup application files
tar -czf $BACKUP_DIR/files_$TIMESTAMP.tar.gz /var/www/metal-aloud

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

## Security Checklist

- [ ] Firewall configured and enabled
- [ ] SSL certificates installed
- [ ] Fail2ban active
- [ ] Secure file permissions set
- [ ] Environment variables protected
- [ ] Database access restricted
- [ ] Regular backups configured
- [ ] Automatic updates enabled
- [ ] Monitoring tools installed
- [ ] Rate limiting configured
- [ ] Security headers implemented

## Maintenance

1. Update application:
```bash
cd /var/www/metal-aloud
git pull
npm install
npm run build
pm2 reload all
```

2. Monitor logs:
```bash
pm2 logs
sudo tail -f /var/log/nginx/error.log
```

3. Check system status:
```bash
htop
pm2 monit
```

## Troubleshooting

1. Check application status:
```bash
pm2 status
pm2 logs metal-aloud
```

2. Verify Nginx configuration:
```bash
sudo nginx -t
sudo systemctl status nginx
```

3. Check SSL certificates:
```bash
sudo certbot certificates
```

4. Monitor security:
```bash
sudo fail2ban-client status
sudo tail -f /var/log/auth.log
```

## Support

For additional support:
- GitHub Issues: https://github.com/yourusername/metal-aloud/issues
- Documentation: https://docs.metalaloud.com
- Email: support@metalaloud.com