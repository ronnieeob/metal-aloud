const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const archiver = require('archiver');

// Generate a unique license key
function generateLicenseKey() {
  return crypto.randomBytes(16).toString('hex');
}

// Create the deployment package
async function createDeploymentPackage() {
  const output = fs.createWriteStream('metal-aloud-deploy.zip');
  const archive = archiver('zip', { zlib: { level: 9 } });

  output.on('close', () => {
    console.log(`\nDeployment package created (${archive.pointer()} bytes)`);
    console.log('\nLicense Key:', licenseKey);
    console.log('\nInstallation Instructions:');
    console.log('1. Upload metal-aloud-deploy.zip to your web server');
    console.log('2. Extract the files');
    console.log('3. Navigate to install.php in your browser');
    console.log('4. Follow the installation wizard');
  });

  archive.on('error', (err) => {
    throw err;
  });

  archive.pipe(output);

  // Generate license key
  const licenseKey = generateLicenseKey();

  // Add all source files
  archive.directory('src/', 'src/');
  archive.directory('public/', 'public/');
  archive.directory('dist/', 'dist/');

  // Add database migrations
  archive.directory('database/migrations/', 'database/migrations/');

  // Add configuration files
  archive.file('package.json', { name: 'package.json' });
  archive.file('vite.config.ts', { name: 'vite.config.ts' });
  archive.file('tsconfig.json', { name: 'tsconfig.json' });
  archive.file('README.md', { name: 'README.md' });
  archive.file('install.php', { name: 'install.php' });

  // Create .htaccess for Apache servers
  const htaccess = `
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>

# Security headers
<IfModule mod_headers.c>
  Header set X-Content-Type-Options "nosniff"
  Header set X-XSS-Protection "1; mode=block"
  Header set X-Frame-Options "SAMEORIGIN"
  Header set Referrer-Policy "strict-origin-when-cross-origin"
</IfModule>

# Disable directory listing
Options -Indexes

# Protect sensitive files
<FilesMatch "^\.env|config\.json|composer\.json|package\.json|package-lock\.json">
  Order allow,deny
  Deny from all
</FilesMatch>
`;

  archive.append(htaccess, { name: '.htaccess' });

  // Create nginx.conf for Nginx servers
  const nginxConf = `
location / {
  try_files $uri $uri/ /index.html;
}

# Security headers
add_header X-Content-Type-Options "nosniff";
add_header X-XSS-Protection "1; mode=block";
add_header X-Frame-Options "SAMEORIGIN";
add_header Referrer-Policy "strict-origin-when-cross-origin";

# Protect sensitive files
location ~ /\.env|config\.json|composer\.json|package\.json|package-lock\.json {
  deny all;
}
`;

  archive.append(nginxConf, { name: 'nginx.conf' });

  // Store license key in a secure format
  const licenseData = {
    key: licenseKey,
    generated: new Date().toISOString(),
    type: 'single-domain'
  };

  archive.append(JSON.stringify(licenseData, null, 2), { name: 'license.json' });

  await archive.finalize();
}

// Run the deployment package creation
createDeploymentPackage().catch(console.error);