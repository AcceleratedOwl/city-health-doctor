#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Building CityPulse for Production...\n');

// Check environment variables
const requiredEnvVars = ['REACT_APP_OPENWEATHER_API_KEY'];
const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
  console.warn('⚠️  Warning: Missing environment variables:', missingVars.join(', '));
  console.warn('   Some features may not work properly in production.\n');
}

// Build the application
console.log('📦 Building React application...');
try {
  execSync('npm run build', { stdio: 'inherit' });
  console.log('✅ Build completed successfully!\n');
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}

// Generate build report
console.log('📊 Generating build report...');
const buildPath = path.join(__dirname, '../build');
const buildStats = {
  timestamp: new Date().toISOString(),
  buildSize: getDirectorySize(buildPath),
  files: getBuildFiles(buildPath),
  environment: {
    nodeVersion: process.version,
    npmVersion: execSync('npm --version', { encoding: 'utf8' }).trim(),
    buildTime: new Date().toISOString()
  }
};

// Write build report
fs.writeFileSync(
  path.join(buildPath, 'build-report.json'),
  JSON.stringify(buildStats, null, 2)
);

console.log('📋 Build Report:');
console.log(`   Build Size: ${formatBytes(buildStats.buildSize)}`);
console.log(`   Files: ${buildStats.files.length}`);
console.log(`   Build Time: ${buildStats.timestamp}\n`);

// Generate deployment checklist
console.log('✅ Deployment Checklist:');
console.log('   [ ] Environment variables configured');
console.log('   [ ] API keys valid and tested');
console.log('   [ ] Build process successful');
console.log('   [ ] PWA features working');
console.log('   [ ] Responsive design tested');
console.log('   [ ] Accessibility features verified');
console.log('   [ ] Performance optimized');
console.log('   [ ] Error handling tested\n');

console.log('🎉 CityPulse is ready for deployment!');
console.log('📖 See DEPLOYMENT.md for deployment instructions.');

function getDirectorySize(dirPath) {
  let totalSize = 0;
  
  function calculateSize(itemPath) {
    const stats = fs.statSync(itemPath);
    if (stats.isDirectory()) {
      const files = fs.readdirSync(itemPath);
      files.forEach(file => {
        calculateSize(path.join(itemPath, file));
      });
    } else {
      totalSize += stats.size;
    }
  }
  
  calculateSize(dirPath);
  return totalSize;
}

function getBuildFiles(dirPath) {
  const files = [];
  
  function scanDirectory(currentPath, relativePath = '') {
    const items = fs.readdirSync(currentPath);
    
    items.forEach(item => {
      const itemPath = path.join(currentPath, item);
      const relativeItemPath = path.join(relativePath, item);
      const stats = fs.statSync(itemPath);
      
      if (stats.isDirectory()) {
        scanDirectory(itemPath, relativeItemPath);
      } else {
        files.push({
          path: relativeItemPath,
          size: stats.size,
          modified: stats.mtime
        });
      }
    });
  }
  
  scanDirectory(dirPath);
  return files;
}

function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}
