# VPS Deployment Guide

This guide will help you deploy the mass-url-visitor on a VPS for continuous operation.

## 🚀 Quick Setup

### 1. Connect to your VPS
```bash
ssh root@your-vps-ip
```

### 2. Clone the repository
```bash
git clone https://github.com/your-username/mass-url-visitor.git
cd mass-url-visitor
```

### 3. Run the setup script
```bash
chmod +x setup-vps.sh
./setup-vps.sh
```

### 4. Configure your URLs
Edit `src/index.js` and update the URLs array:
```javascript
const urls = [
  'https://your-website.com',
  'https://your-website.com/page1',
  'https://your-website.com/page2',
  // Add more URLs as needed
];
```

### 5. Run the visitor
```bash
npm start
```

## ⚙️ Configuration Options

In `src/index.js`, you can adjust these settings:

```javascript
const options = {
  incognito: true,           // Use incognito mode
  delay: 3000,               // Delay between requests (milliseconds)
  headless: true,            // Run in headless mode
  userAgent: 'Mozilla/5.0...' // Custom user agent
};
```

## 🔄 Continuous Operation

### Using PM2 (Recommended)
```bash
# Install PM2
npm install -g pm2

# Start the application
pm2 start src/index.js --name "url-visitor"

# Make it start on boot
pm2 startup
pm2 save

# Monitor the application
pm2 status
pm2 logs url-visitor
```

### Using Screen
```bash
# Install screen
sudo apt install screen

# Create a new screen session
screen -S url-visitor

# Run the application
npm start

# Detach from screen (Ctrl+A, then D)
# Reattach later with: screen -r url-visitor
```

## 📊 Monitoring

### Check if it's running
```bash
# Check Node.js processes
ps aux | grep node

# Check browser processes
ps aux | grep chromium
```

### View logs
```bash
# If using PM2
pm2 logs url-visitor

# If using screen
screen -r url-visitor
```

## 🔧 Troubleshooting

### Common Issues

1. **Puppeteer fails to launch**
   ```bash
   # Reinstall dependencies
   npm install
   ```

2. **Out of memory**
   ```bash
   # Reduce iterations or increase delay
   # Edit src/index.js and change visitor.execute(5) to visitor.execute(2)
   ```

3. **Browser crashes**
   ```bash
   # Restart the application
   pm2 restart url-visitor
   ```

## ⚠️ Important Notes

- **Rate Limiting**: Don't set the delay too low to avoid being blocked
- **IP Rotation**: Consider using a proxy service for better results
- **Legal Compliance**: Ensure you have permission to visit the target websites
- **Resource Usage**: Monitor CPU and memory usage on your VPS

## 🎯 Best Practices

1. Start with low iteration counts (1-5)
2. Use delays of at least 2-3 seconds between requests
3. Rotate user agents periodically
4. Monitor your VPS resources
5. Use incognito mode to avoid cookie/session issues

## 📈 Scaling

For better results, consider:
- Using multiple VPS instances
- Implementing proxy rotation
- Adding more realistic human behavior simulation
- Using different user agents for each request 