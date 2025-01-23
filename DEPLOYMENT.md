# Metal Aloud Deployment Guide

## Prerequisites

- Node.js 18+
- Supabase account
- Netlify account
- Domain name (optional)

## Environment Variables

Create `.env` file:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_SPOTIFY_CLIENT_ID=your_spotify_client_id
VITE_SPOTIFY_CLIENT_SECRET=your_spotify_client_secret
```

## Build Process

1. Install dependencies:
```bash
npm install
```

2. Build project:
```bash
npm run build
```

3. Preview build:
```bash
npm run preview
```

## Deployment Options

### Netlify

1. Connect repository to Netlify
2. Configure build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`
3. Set environment variables
4. Deploy

### Manual Deployment

1. Build project
2. Upload `dist` directory to web server
3. Configure server for SPA routing
4. Set up SSL certificate

## Post-Deployment

1. Verify all routes work
2. Check environment variables
3. Test authentication
4. Monitor error logs

## Monitoring

- Use Netlify analytics
- Monitor Supabase usage
- Check error logs
- Set up uptime monitoring

## Backup

1. Regular database backups
2. Store assets in secure location
3. Document recovery procedures

## Support

For deployment issues:
- Check logs
- Review documentation
- Contact support team