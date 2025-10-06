# CityPulse Deployment Guide
## NASA Space Apps Challenge 2025

This guide covers deploying CityPulse to various platforms and environments.

---

## 🚀 Quick Deployment Options

### 1. Vercel (Recommended)
**Best for: Production deployment with automatic CI/CD**

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy from project root
vercel

# Set environment variables
vercel env add REACT_APP_OPENWEATHER_API_KEY
```

**Vercel Configuration:**
- Framework: Create React App
- Build Command: `npm run build`
- Output Directory: `build`
- Install Command: `npm install`

### 2. Netlify
**Best for: Static hosting with form handling**

```bash
# Install Netlify CLI
npm i -g netlify-cli

# Build and deploy
npm run build
netlify deploy --prod --dir=build
```

**Netlify Configuration:**
- Build Command: `npm run build`
- Publish Directory: `build`
- Environment Variables: Set in Netlify dashboard

### 3. GitHub Pages
**Best for: Free hosting with GitHub integration**

```bash
# Install gh-pages
npm install --save-dev gh-pages

# Add to package.json scripts
"homepage": "https://yourusername.github.io/citypulse",
"predeploy": "npm run build",
"deploy": "gh-pages -d build"

# Deploy
npm run deploy
```

---

## 🔧 Environment Setup

### Required Environment Variables

Create a `.env` file in the project root:

```env
# OpenWeatherMap API Key (Required)
REACT_APP_OPENWEATHER_API_KEY=your_api_key_here

# Optional API Keys
REACT_APP_WAQI_API_KEY=your_waqi_key_here
REACT_APP_SENTINEL_HUB_API_KEY=your_sentinel_key_here

# Environment
NODE_ENV=production
REACT_APP_ENV=production
```

### API Key Setup

1. **OpenWeatherMap API**
   - Visit: https://openweathermap.org/api
   - Sign up for free account
   - Generate API key
   - Add to environment variables

2. **Optional APIs**
   - WAQI: https://aqicn.org/api/
   - Sentinel Hub: https://www.sentinel-hub.com/

---

## 🏗️ Build Configuration

### Production Build

```bash
# Install dependencies
npm install

# Create production build
npm run build

# Test production build locally
npx serve -s build -l 3000
```

### Build Optimization

The build process includes:
- ✅ Code splitting and lazy loading
- ✅ Asset optimization
- ✅ Bundle size analysis
- ✅ PWA manifest generation
- ✅ Service worker registration

---

## 📱 PWA Features

### Service Worker
- Automatic caching of static assets
- Offline functionality
- Background sync
- Push notifications (future)

### Manifest
- App installation prompts
- Custom icons and splash screens
- Standalone app experience
- Cross-platform compatibility

### Performance
- Lazy loading of components
- Image optimization
- Bundle splitting
- Memory management

---

## 🌐 CDN and Assets

### Static Assets
- Leaflet.js and CSS (CDN)
- Fonts (Google Fonts)
- Icons (Emoji and custom)

### CDN Configuration
```html
<!-- Leaflet CSS -->
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />

<!-- Leaflet JS -->
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
```

---

## 🔒 Security Considerations

### API Security
- Environment variables for API keys
- CORS configuration
- Rate limiting
- Input validation

### Content Security Policy
```html
<meta http-equiv="Content-Security-Policy" 
      content="default-src 'self'; 
               script-src 'self' 'unsafe-inline' https://unpkg.com; 
               style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; 
               font-src 'self' https://fonts.gstatic.com;">
```

---

## 📊 Monitoring and Analytics

### Performance Monitoring
- Core Web Vitals tracking
- API response time monitoring
- Error tracking
- User interaction analytics

### Health Checks
- API endpoint monitoring
- Service availability
- Data quality metrics
- User experience metrics

---

## 🚀 Deployment Checklist

### Pre-Deployment
- [ ] Environment variables configured
- [ ] API keys valid and tested
- [ ] Build process successful
- [ ] PWA features working
- [ ] Responsive design tested
- [ ] Accessibility features verified

### Post-Deployment
- [ ] Domain configuration
- [ ] SSL certificate active
- [ ] Performance monitoring setup
- [ ] Error tracking configured
- [ ] Analytics integration
- [ ] User feedback collection

---

## 🔧 Troubleshooting

### Common Issues

1. **API Key Errors**
   ```bash
   # Check environment variables
   echo $REACT_APP_OPENWEATHER_API_KEY
   ```

2. **Build Failures**
   ```bash
   # Clear cache and rebuild
   rm -rf node_modules package-lock.json
   npm install
   npm run build
   ```

3. **PWA Not Working**
   - Check manifest.json
   - Verify service worker registration
   - Test HTTPS requirement

4. **Performance Issues**
   - Enable performance monitoring
   - Check bundle size
   - Optimize images and assets

### Debug Mode
```bash
# Enable debug logging
REACT_APP_DEBUG=true npm start
```

---

## 📈 Performance Optimization

### Bundle Analysis
```bash
# Analyze bundle size
npm install -g webpack-bundle-analyzer
npm run build
npx webpack-bundle-analyzer build/static/js/*.js
```

### Image Optimization
- Use WebP format where supported
- Implement lazy loading
- Responsive images
- Compression optimization

### Code Splitting
- Route-based splitting
- Component-based splitting
- Dynamic imports
- Lazy loading

---

## 🌍 International Deployment

### Multi-Region Setup
- CDN configuration
- Regional API endpoints
- Localization support
- Timezone handling

### Compliance
- GDPR compliance
- Data privacy
- Accessibility standards
- Security requirements

---

## 📞 Support and Maintenance

### Monitoring
- Uptime monitoring
- Performance tracking
- Error reporting
- User analytics

### Updates
- Automated deployments
- Version control
- Rollback procedures
- Testing protocols

---

**Deployment Status:** ✅ Ready for Production
**Last Updated:** January 2025
**Version:** 1.0.0
