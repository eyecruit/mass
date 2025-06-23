import HeadlessVisitor from './HeadlessVisitor.js';

// List of URLs to visit
const urls = [
  'https://thelogicore.com',
  'https://thelogicore.com/contact',
  'https://thelogicore.com/about',
  'https://thelogicore.com/case-studies',
  'https://thelogicore.com/projects',
  'https://thelogicore.com/contact',
  'https://thelogicore.com/about',
  'https://thelogicore.com/case-studies',
];

// Configuration options
const options = {
  incognito: true,           // Use incognito mode
  delay: 3000,               // 3 seconds delay between requests
  headless: true,            // Run in headless mode (perfect for VPS)
  userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
};

// Create visitor instance
const visitor = new HeadlessVisitor(urls, options);

// Execute with 5 iterations (adjust as needed)
visitor.execute(5);
