# CloudPanel Deployment Guide

## Prerequisites

1. CloudPanel installed on Ubuntu 20.04 or higher
2. Domain pointed to your server
3. SSH access with root privileges
4. Git repository access

## Quick Deploy

1. SSH into your server:
```bash
ssh root@your-server-ip
```

2. Download the deployment script:
```bash
wget https://raw.githubusercontent.com/yourusername/metal-aloud/main/deploy/cloudpanel.sh
```

3. Make it executable:
```bash
chmod +x cloudpanel.sh
```

4. Update the domain in the script:
```bash
nano cloudpanel.sh
# Update DOMAIN="your-domain.com" with your actual domain
```

5. Run the deployment script:
```bash
./cloudpanel.sh
```

## Post-Installation

1. Update environment variables:
```bash
nano /home/cloudpanel/htdocs/your-domain.com/.env
```

2. Test the application:
```bash
curl -I https://your-domain.com
```

3. Monitor the application:
```bash
pm2 status
pm2 logs metal-aloud
```

## Maintenance

### Update Application
```bash
cd /home/cloudpanel/htdocs/your-domain.com
./deploy.sh
```

### System Updates
```bash
./maintenance.sh
```

### View Logs
```bash
# Application logs
pm2 logs metal-aloud

# Nginx access logs
tail -f /var/log/nginx/access.log

# Nginx error logs
tail -f /var/log/nginx/error.log
```

### SSL Certificate Renewal
Certificates will auto-renew, but you can test renewal with:
```bash
certbot renew --dry-run
```

## Security

1. Firewall is configured to allow only HTTP, HTTPS, and SSH
2. Automatic security updates are enabled
3. SSL/TLS is configured with modern security settings
4. Rate limiting is enabled for API endpoints
5. Sensitive files are protected

## Troubleshooting

1. Check application status:
```bash
pm2 status
```

2. Check Nginx configuration:
```bash
nginx -t
```

3. View error logs:
```bash
pm2 logs metal-aloud --err
```

4. Restart services:
```bash
pm2 restart metal-aloud
systemctl restart nginx
```

## Support

For additional support:
- Check CloudPanel documentation
- Contact support@metalaloud.com