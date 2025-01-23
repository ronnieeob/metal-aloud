# Metal Aloud Deployment Guide

This guide explains how to deploy Metal Aloud on a Hostinger VPS running Ubuntu.

## Prerequisites

1. A Hostinger VPS with Ubuntu 20.04 or higher
2. A domain name pointed to your VPS
3. SSH access to your VPS
4. Root or sudo privileges

## Step 1: Initial Server Setup

1. Log in to your Hostinger VPS Control Panel
2. Navigate to the VPS section
3. Note your server's IP address
4. Connect via SSH:
   ```bash
   ssh root@your-server-ip
   ```

## Step 2: Update System and Install Dependencies

1. Update the package list and upgrade installed packages:
   ```bash
   apt update && apt upgrade -y
   ```

2. Install required packages:
   ```bash
   apt install -y nginx \
     certbot \
     python3-certbot-nginx \
     nodejs \
     npm \
     git \
     ufw
   ```

## Step 3: Configure Firewall

1. Allow Nginx and SSH through the firewall:
   ```bash
   ufw allow 'Nginx Full'
   ufw allow OpenSSH
   ufw enable
   ```

## Step 4: Configure Supabase

1. Create a Supabase project at https://supabase.com
2. Get your project URL and anon key
3. Update the environment variables:
   ```env
   VITE_SUPABASE_URL=your_project_url
   VITE_SUPABASE_ANON_KEY=your_anon_key
   ```

## Step 5: Configure Nginx

1. Copy the Nginx configuration:
   ```bash
   cp deploy/nginx.conf /etc/nginx/sites-available/metal-aloud
   ```

2. Create symbolic link:
   ```bash
   ln -s /etc/nginx/sites-available/metal-aloud /etc/nginx/sites-enabled/
   ```

3. Remove default configuration:
   ```bash
   rm /etc/nginx/sites-enabled/default
   ```

4. Test and restart Nginx:
   ```bash
   nginx -t
   systemctl restart nginx
   ```

## Step 6: Set Up SSL

1. Install SSL certificate:
   ```bash
   certbot --nginx -d your-domain.com -d www.your-domain.com
   ```

## Step 7: Deploy Application

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/metal-aloud.git /var/www/metal-aloud
   ```

2. Install dependencies:
   ```bash
   cd /var/www/metal-aloud
   npm install
   ```

3. Create environment file:
   ```bash
   cp .env.example .env
   ```

4. Update environment variables in .env:
   ```
   VITE_SUPABASE_URL=your_project_url
   VITE_SUPABASE_ANON_KEY=your_anon_key
   ```

5. Build the application:
   ```bash
   npm run build
   ```

6. Set up PM2:
   ```bash
   npm install -g pm2
   pm2 start ecosystem.config.js
   pm2 save
   pm2 startup
   ```

## Step 8: Set Up Automatic Deployment

1. Create a deployment key:
   ```bash
   ssh-keygen -t rsa -b 4096 -C "deploy@your-domain.com"
   ```

2. Add the public key to your repository's deploy keys

3. Set up automatic deployment:
   ```bash
   pm2 install pm2-auto-pull
   ```

## Step 9: Final Steps

1. Set proper permissions:
   ```bash
   chown -R www-data:www-data /var/www/metal-aloud
   chmod -R 755 /var/www/metal-aloud
   ```

2. Test the application:
   - Visit https://your-domain.com
   - Test all major features
   - Check error logs:
     ```bash
     tail -f /var/log/nginx/error.log
     pm2 logs
     ```

## Maintenance

### Updating the Application

1. Pull latest changes:
   ```bash
   cd /var/www/metal-aloud
   git pull
   ```

2. Install dependencies and rebuild:
   ```bash
   npm install
   npm run build
   ```

3. Restart the application:
   ```bash
   pm2 restart all
   ```

### Backup

1. Supabase provides built-in backup and restore functionality

2. Files backup:
   ```bash
   tar -czf metal-aloud-backup.tar.gz /var/www/metal-aloud
   ```

### Monitoring

1. Check application status:
   ```bash
   pm2 status
   ```

2. View logs:
   ```bash
   pm2 logs
   ```

3. Monitor system resources:
   ```bash
   pm2 monit
   ```

## Troubleshooting

### Common Issues

1. **502 Bad Gateway**
   - Check if Node.js server is running:
     ```bash
     pm2 status
     ```
   - Check Nginx error logs:
     ```bash
     tail -f /var/log/nginx/error.log
     ```

2. **Supabase Connection Issues**
   - Verify Supabase project is active
   - Check Supabase URL and anon key in .env
   - Verify network connectivity

3. **Permission Issues**
   - Reset permissions:
     ```bash
     chown -R www-data:www-data /var/www/metal-aloud
     chmod -R 755 /var/www/metal-aloud
     ```

### Support

For additional support:
- Check the [GitHub repository](https://github.com/yourusername/metal-aloud)
- Contact Hostinger support
- Join our Discord community