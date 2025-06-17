# डिप्लॉयमेंट गाइड - Deployment Guide

## तुरंत उपयोग के लिए

### विकल्प 1: GitHub Pages (मुफ्त)
1. GitHub पर नया repository बनाएं
2. सभी फ़ाइलें अपलोड करें
3. Settings > Pages में जाएं
4. Source को "Deploy from a branch" चुनें
5. Branch को "main" चुनें
6. Save करें - आपकी साइट live हो जाएगी

### विकल्प 2: Netlify (मुफ्त)
1. [Netlify.com](https://netlify.com) पर जाएं
2. "Deploy to Netlify" पर क्लिक करें
3. फ़ोल्डर को drag & drop करें
4. तुरंत live URL मिलेगा

### विकल्प 3: Vercel (मुफ्त)
1. [Vercel.com](https://vercel.com) पर जाएं
2. "New Project" पर क्लिक करें
3. फ़ाइलें अपलोड करें
4. Deploy करें

### विकल्प 4: Firebase Hosting
```bash
# Firebase CLI install करें
npm install -g firebase-tools

# Login करें
firebase login

# Project initialize करें
firebase init hosting

# Deploy करें
firebase deploy
```

## कस्टम डोमेन सेटअप

### Cloudflare के साथ (अनुशंसित)
1. Cloudflare पर अकाउंट बनाएं
2. अपना डोमेन add करें
3. DNS records set करें:
   ```
   Type: CNAME
   Name: www
   Content: your-netlify-site.netlify.app
   ```

### GoDaddy/Namecheap के साथ
1. DNS Management में जाएं
2. A Record add करें:
   ```
   Host: @
   Points to: [hosting provider IP]
   ```

## SSL Certificate
सभी modern hosting providers automatic SSL provide करते हैं।

## Performance Optimization

### 1. Image Optimization
```bash
# Images को compress करें
npm install -g imagemin-cli
imagemin images/* --out-dir=images/optimized
```

### 2. CSS/JS Minification
```bash
# CSS minify करें
npm install -g clean-css-cli
cleancss -o style.min.css style.css

# JS minify करें
npm install -g uglify-js
uglifyjs main.js -o main.min.js
```

### 3. Gzip Compression
Hosting provider में enable करें या `.htaccess` में add करें:
```apache
<IfModule mod_deflate.c>
    AddOutputFilterByType DEFLATE text/plain
    AddOutputFilterByType DEFLATE text/html
    AddOutputFilterByType DEFLATE text/xml
    AddOutputFilterByType DEFLATE text/css
    AddOutputFilterByType DEFLATE application/xml
    AddOutputFilterByType DEFLATE application/xhtml+xml
    AddOutputFilterByType DEFLATE application/rss+xml
    AddOutputFilterByType DEFLATE application/javascript
    AddOutputFilterByType DEFLATE application/x-javascript
</IfModule>
```

## Security Headers

### .htaccess में add करें:
```apache
# Security Headers
Header always set X-Content-Type-Options nosniff
Header always set X-Frame-Options DENY
Header always set X-XSS-Protection "1; mode=block"
Header always set Strict-Transport-Security "max-age=63072000; includeSubDomains; preload"
Header always set Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' https://www.gstatic.com https://apis.google.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com;"
```

## Monitoring Setup

### Google Analytics
```html
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_TRACKING_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_TRACKING_ID');
</script>
```

### Firebase Analytics
```javascript
// Firebase Analytics
import { getAnalytics } from "firebase/analytics";
const analytics = getAnalytics(app);
```

## Backup Strategy

### 1. Code Backup
- GitHub repository में code store करें
- Regular commits करें

### 2. Database Backup
```javascript
// Firestore backup script
const admin = require('firebase-admin');
const fs = require('fs');

async function backupFirestore() {
  const db = admin.firestore();
  const collections = ['users', 'gameData', 'referrals'];
  
  for (const collection of collections) {
    const snapshot = await db.collection(collection).get();
    const data = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    fs.writeFileSync(`backup-${collection}-${Date.now()}.json`, JSON.stringify(data, null, 2));
  }
}
```

## Scaling Considerations

### 1. CDN Setup
- Cloudflare CDN enable करें
- Static assets को CDN से serve करें

### 2. Database Optimization
- Firestore indexes optimize करें
- Query limits set करें

### 3. Caching Strategy
```javascript
// Service Worker for caching
self.addEventListener('fetch', event => {
  if (event.request.destination === 'image') {
    event.respondWith(
      caches.open('images').then(cache => {
        return cache.match(event.request).then(response => {
          return response || fetch(event.request).then(fetchResponse => {
            cache.put(event.request, fetchResponse.clone());
            return fetchResponse;
          });
        });
      })
    );
  }
});
```

## Maintenance

### Daily Tasks
- Check error logs
- Monitor user activity
- Backup database

### Weekly Tasks
- Update dependencies
- Check performance metrics
- Review security logs

### Monthly Tasks
- Full system backup
- Performance optimization
- Security audit

## Troubleshooting

### Common Issues

1. **Firebase Connection Error**
   - Check API keys
   - Verify domain in Firebase console

2. **Mobile Display Issues**
   - Test on real devices
   - Check viewport meta tag

3. **Slow Loading**
   - Optimize images
   - Enable compression
   - Use CDN

### Debug Mode
```javascript
// Enable debug mode
const DEBUG_MODE = window.location.hostname === 'localhost';
if (DEBUG_MODE) {
  console.log('Debug mode enabled');
}
```

## Support

### Technical Support
- Firebase Documentation: https://firebase.google.com/docs
- MDN Web Docs: https://developer.mozilla.org

### Community
- Stack Overflow
- Firebase Community
- GitHub Issues

---

**नोट**: यह गाइड आपकी वेबसाइट को successfully deploy करने के लिए सभी आवश्यक जानकारी प्रदान करती है। किसी भी समस्या के लिए documentation देखें या community support लें।

