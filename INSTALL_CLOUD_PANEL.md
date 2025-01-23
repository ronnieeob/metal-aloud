# Metal Aloud - Cloud Panel Installation Guide

## Prerequisites

- Ubuntu 20.04 or higher
- Cloud Panel access
- SSH access to your server
- Domain pointed to your server's nameservers

## Step 1: Initial Server Setup

1. Log in to Cloud Panel:
   - Access your Cloud Panel dashboard
   - Navigate to the Domains section

2. Add Domain:
   - Click "Add Domain"
   - Enter your domain name
   - Select PHP version 8.1
   - Enable Let's Encrypt SSL

3. SSH into your server:
```bash
ssh username@your-server-ip
```

## Step 2: Configure Node.js

1. Install Node.js via Cloud Panel:
   - Go to Settings > Node.js Manager
   - Click "Add Node.js Version"
   - Select version 18.x
   - Click Install

2. Create Node.js Application:
   - Go to your domain settings
   - Click "Node.js Apps"
   - Click "Add Node.js Application"
   - Fill in:
     - Name: metal-aloud
     - Node.js Version: 18.x
     - Path: /metal-aloud
     - Start File: dist/server/index.js
     - Environment: Production

## Step 3: Application Deployment

1. Navigate to application directory:
```bash
cd /home/username/htdocs/your-domain/metal-aloud
```

2. Clone repository:
```bash
git clone https://github.com/yourusername/metal-aloud.git .
```

3. Install dependencies:
```bash
npm install
```

4. Create environment file:
```bash
cp .env.example .env
```

5. Update environment variables:
```env
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Domain Configuration
DOMAIN=your-domain.com
ADMIN_EMAIL=admin@your-domain.com
```

6. Build application:
```bash
npm run build
```

## Step 4: Configure Web Server

1. Add custom Nginx rules:
   - Go to domain settings
   - Click "Nginx Directives"
   - Add:
```nginx
# Rate limiting
limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;

# API proxy
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

# Security headers
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header X-Content-Type-Options "nosniff" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
add_header Content-Security-Policy "default-src 'self' https:; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' https: data:; font-src 'self' https: data:;" always;
```

## Step 5: Process Management

1. Configure PM2 via Cloud Panel:
   - Go to domain settings > Node.js Apps
   - Click on your application
   - Set:
     - Instances: max
     - Exec Mode: cluster
     - Watch: enabled

2. Start application:
   - Click "Restart" in Cloud Panel Node.js Apps section

## Step 6: Security Setup

1. Configure Firewall (managed by Cloud Panel):
   - Default rules are set automatically
   - Additional ports can be opened in Security > Firewall

2. Set up fail2ban (pre-configured in Cloud Panel):
   - Additional rules can be added in Security > Fail2ban

3. Set proper file permissions:
```bash
find /home/username/htdocs/your-domain/metal-aloud -type d -exec chmod 755 {} \;
find /home/username/htdocs/your-domain/metal-aloud -type f -exec chmod 644 {} \;
chmod 400 .env
```

## Step 7: Backup Configuration

1. Configure backups in Cloud Panel:
   - Go to Backup > Settings
   - Enable daily backups
   - Set retention period
   - Configure backup time

2. Additional backup script:
```bash
#!/bin/bash
BACKUP_DIR=/home/username/backups/metal-aloud
DATE=$(date +%Y%m%d)

# Create backup directory
mkdir -p $BACKUP_DIR

# Backup files
tar -czf $BACKUP_DIR/files_$DATE.tar.gz /home/username/htdocs/your-domain/metal-aloud

# Keep only last 7 days
find $BACKUP_DIR -type f -mtime +7 -delete
```

## Step 8: Monitoring Setup

1. Configure monitoring in Cloud Panel:
   - Go to Monitoring
   - Enable all monitoring options
   - Set alert thresholds

2. Set up log rotation:
   - Managed automatically by Cloud Panel
   - Additional configurations in Logs section

## Maintenance

1. Update application:
```bash
cd /home/username/htdocs/your-domain/metal-aloud
git pull
npm install
npm run build
```

2. View logs in Cloud Panel:
   - Go to Logs
   - Select application logs
   - Filter by severity

3. Monitor resources:
   - Check Cloud Panel dashboard
   - View resource graphs
   - Monitor error logs

## Troubleshooting

1. Application Issues:
   - Check Node.js app status in Cloud Panel
   - View application logs
   - Restart Node.js application

2. Database Issues:
   - Check Supabase connection
   - Verify environment variables
   - Test database queries

3. SSL Issues:
   - Verify SSL status in domain settings
   - Check Let's Encrypt renewal status
   - Force SSL renewal if needed

## Security Best Practices

1. Regular Updates:
   - Enable automatic updates in Cloud Panel
   - Keep Node.js version updated
   - Update npm packages regularly

2. Access Control:
   - Use strong passwords
   - Enable two-factor authentication
   - Restrict SSH access

3. Monitoring:
   - Check security logs regularly
   - Monitor failed login attempts
   - Review resource usage

## Support

For additional support:
- Cloud Panel Documentation
- Metal Aloud Documentation
- Technical Support: support@metalaloud.com