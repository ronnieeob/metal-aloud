# Ubuntu Deployment Guide for Hostinger VPS

## Server Details
- Subdomain: srv685290.hstgr.cloud
- Site User: hstgr-srv685290
- Root Directory: /home/hstgr-srv685290/htdocs/srv685290.hstgr.cloud
- App Port: 3001
- Node Version: 22

## Prerequisites

1. Hostinger VPS with Ubuntu 20.04 or higher
2. SSH access with root privileges
3. Git repository access
4. Node.js 22+ (will be installed via NVM)

## Quick Deploy

1. SSH into your Hostinger VPS:
```bash
ssh hstgr-srv685290@srv685290.hstgr.cloud
```

2. Download the deployment script:
```bash
wget https://raw.githubusercontent.com/ronnieeob/jhumpa/main/deploy/ubuntu.sh
```

3. Make it executable:
```bash
chmod +x ubuntu.sh
```

4. Run the deployment script:
```bash
sudo ./ubuntu.sh
```

## Post-Installation

1. Verify the application is running:
```bash
pm2 status srv685290-metal
```

2. Check the logs:
```bash
pm2 logs srv685290-metal
```

3. Monitor the application:
```bash
pm2 monit
```

## Directory Structure

```
/home/hstgr-srv685290/
├── htdocs/
│   └── srv685290.hstgr.cloud/  # Application root
│       ├── dist/               # Built application
│       ├── src/                # Source code
│       ├── .env               # Environment variables
│       └── ecosystem.config.cjs # PM2 configuration
└── logs/                      # Application logs
    ├── srv685290-metal-error.log
    └── srv685290-metal-out.log
```

## Maintenance

### Update Application
```bash
cd /home/hstgr-srv685290/htdocs/srv685290.hstgr.cloud
./deploy.sh
```

### System Maintenance
```bash
./maintenance.sh
```

### View Logs
```bash
# Application logs
pm2 logs srv685290-metal

# Error logs
tail -f /home/hstgr-srv685290/logs/srv685290-metal-error.log

# Output logs
tail -f /home/hstgr-srv685290/logs/srv685290-metal-out.log

# Apache logs
tail -f /var/log/apache2/error.log
tail -f /var/log/apache2/access.log
```

### Restart Services
```bash
# Restart application
pm2 restart srv685290-metal

# Restart Apache
sudo systemctl restart apache2
```

## Security Features

1. File Permissions
   - Directories: 755
   - Files: 644
   - Sensitive files (.env): 600
   - Proper ownership (hstgr-srv685290:hstgr-srv685290)

2. Apache Security
   - Mod_rewrite enabled
   - Security headers configured
   - Sensitive files protected
   - Directory listing disabled
   - Compression enabled
   - Cache control configured

3. Node.js Security
   - Running as non-root user
   - Process management via PM2
   - Memory limits configured
   - Automatic restarts enabled

4. Environment Security
   - Environment variables properly configured
   - Sensitive data protected
   - Configuration files secured

## Troubleshooting

1. Application Issues
```bash
# Check application status
pm2 status

# View error logs
pm2 logs srv685290-metal --err

# Restart application
pm2 restart srv685290-metal
```

2. Apache Issues
```bash
# Test Apache configuration
apachectl -t

# View Apache error logs
tail -f /var/log/apache2/error.log

# Restart Apache
systemctl restart apache2
```

3. Permission Issues
```bash
# Reset permissions
find /home/hstgr-srv685290/htdocs/srv685290.hstgr.cloud -type d -exec chmod 755 {} \;
find /home/hstgr-srv685290/htdocs/srv685290.hstgr.cloud -type f -exec chmod 644 {} \;
chmod 600 /home/hstgr-srv685290/htdocs/srv685290.hstgr.cloud/.env
```

4. Node.js Issues
```bash
# Verify Node.js version
node --version

# Reinstall dependencies
npm ci

# Rebuild application
npm run build
```

## Common Commands

### PM2
```bash
# List applications
pm2 list

# Monitor application
pm2 monit

# View logs
pm2 logs

# Restart application
pm2 restart srv685290-metal

# Save PM2 configuration
pm2 save
```

### File Management
```bash
# View disk usage
du -sh /home/hstgr-srv685290/htdocs/srv685290.hstgr.cloud/*

# Check log sizes
ls -lh /home/hstgr-srv685290/logs/

# Clear logs
pm2 flush
```

### System
```bash
# Check memory usage
free -h

# Check disk space
df -h

# Monitor system resources
top
```

## Support

For additional support:
- Check Hostinger VPS documentation
- Contact Hostinger support
- Email: support@metalaloud.com
- Submit issues on GitHub

## Important Notes

1. Always backup before major changes:
```bash
# Backup application files
tar -czf backup.tar.gz /home/hstgr-srv685290/htdocs/srv685290.hstgr.cloud

# Backup logs
tar -czf logs-backup.tar.gz /home/hstgr-srv685290/logs
```

2. Monitor resource usage:
   - Check PM2 memory limits
   - Monitor disk space
   - Watch log file sizes

3. Keep system updated:
```bash
# Update system packages
sudo apt update
sudo apt upgrade

# Update Node.js dependencies
npm audit
npm update
```

4. Regular maintenance:
   - Run maintenance script weekly
   - Check logs for errors
   - Monitor application performance
   - Update security patches