# Hostinger VPS Deployment Guide

## Server Details
- Domain: srv685290.hstgr.cloud
- Site User: hstgr-srv685290
- IP Address: 147.79.78.2
- Root Directory: /home/hstgr-srv685290/htdocs/srv685290.hstgr.cloud

## Quick Deploy

1. SSH into your server:
```bash
ssh hstgr-srv685290@147.79.78.2
```

2. Download the deployment script:
```bash
wget https://raw.githubusercontent.com/yourusername/metal-aloud/main/deploy/hostinger.sh
```

3. Make it executable:
```bash
chmod +x hostinger.sh
```

4. Run the deployment script:
```bash
sudo ./hostinger.sh
```

## Post-Installation

1. Verify the application is running:
```bash
pm2 status
```

2. Check the logs:
```bash
pm2 logs srv685290-metal
```

3. Monitor the application:
```bash
pm2 monit
```

## Maintenance

### Update Application
```bash
cd /home/hstgr-srv685290/htdocs/srv685290.hstgr.cloud
./deploy.sh
```

### View Logs
```bash
# Application logs
tail -f /home/hstgr-srv685290/logs/srv685290-metal-error.log
tail -f /home/hstgr-srv685290/logs/srv685290-metal-out.log

# Apache access logs
tail -f /var/log/apache2/access.log

# Apache error logs
tail -f /var/log/apache2/error.log
```

### Restart Services
```bash
# Restart application
pm2 restart srv685290-metal

# Restart Apache
sudo systemctl restart apache2
```

## Security

1. File permissions are set correctly:
   - Directories: 755
   - Files: 644
   - Sensitive files: 400

2. Security headers are configured in .htaccess

3. Rate limiting is enabled

4. Sensitive files are protected

## Troubleshooting

1. If the application is not responding:
```bash
pm2 restart srv685290-metal
```

2. If Apache is showing errors:
```bash
sudo apachectl -t
sudo systemctl restart apache2
```

3. If you need to clear PM2 logs:
```bash
pm2 flush
```

4. To check server resources:
```bash
htop
```

## Support

For additional support:
- Check Hostinger documentation
- Contact Hostinger support
- Email: support@metalaloud.com