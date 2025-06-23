import UltraFastVisitor from './UltraFastVisitor.js';

// List of URLs to visit
const urls = [
  'https://thelogicore.com/case-studies',
  'https://thelogicore.com/projects',
  'https://thelogicore.com/about',
  'https://thelogicore.com',
  'https://thelogicore.com/contact',
  'https://www.thelogicore.com/services/web-development',
];

// Configuration options for ULTRA MAXIMUM SPEED
const options = {
  incognito: true,           // Use incognito mode
  headless: true,            // Run in headless mode (perfect for VPS)
  workers: 10,                // Number of worker threads (increased for speed)
  concurrentPages: 8,        // Pages per worker (increased for speed)
  userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
};

// Create ultra-fast visitor instance
const visitor = new UltraFastVisitor(urls, options);

// Execute with 15 iterations for maximum views
visitor.execute(15);
