import puppeteer from 'puppeteer';

class HeadlessVisitor {
  /**
   * @param {string[]} urls - Array of URLs to visit
   * @param {Object} options - Configuration options
   * @param {boolean} options.incognito - Whether to use incognito mode
   * @param {number} options.delay - Delay between requests in milliseconds
   * @param {boolean} options.headless - Whether to run in headless mode
   * @param {string} options.userAgent - Custom user agent string
   */
  constructor(urls, options = {}) {
    if (!urls || urls.length === 0) {
      throw new Error('URLs cannot be empty!');
    }

    this._urls = urls;
    this._options = {
      incognito: options.incognito || false,
      delay: options.delay || 2000,
      headless: options.headless !== false, // Default to true for VPS
      userAgent: options.userAgent || 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    };
    
    this._browser = null;
    this._context = null;
  }

  /**
   * Initialize the browser
   */
  async _initBrowser() {
    console.log('🚀 Starting headless browser...');
    
    this._browser = await puppeteer.launch({
      headless: this._options.headless,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--disable-gpu',
        '--disable-background-timer-throttling',
        '--disable-backgrounding-occluded-windows',
        '--disable-renderer-backgrounding',
        '--disable-features=TranslateUI',
        '--disable-ipc-flooding-protection'
      ]
    });

    if (this._options.incognito) {
      this._context = await this._browser.createIncognitoBrowserContext();
    } else {
      this._context = this._browser.defaultBrowserContext();
    }

    console.log('✅ Browser initialized successfully');
  }

  /**
   * Visit a single URL
   * @param {string} url - URL to visit
   * @param {number} index - Current iteration index
   */
  async _visitUrl(url, index) {
    try {
      const page = await this._context.newPage();
      
      // Set user agent
      await page.setUserAgent(this._options.userAgent);
      
      // Set viewport
      await page.setViewport({ width: 1920, height: 1080 });
      
      // Enable JavaScript
      await page.setJavaScriptEnabled(true);
      
      console.log(`📱 Visiting: ${url} (Iteration ${index + 1})`);
      
      // Navigate to the URL
      await page.goto(url, { 
        waitUntil: 'networkidle2',
        timeout: 30000 
      });
      
      // Wait for page to load completely
      await page.waitForTimeout(3000);
      
      // Simulate some human-like behavior
      await this._simulateHumanBehavior(page);
      
      console.log(`✅ Successfully visited: ${url}`);
      
      // Close the page
      await page.close();
      
    } catch (error) {
      console.error(`❌ Error visiting ${url}:`, error.message);
    }
  }

  /**
   * Simulate human-like behavior
   * @param {Page} page - Puppeteer page object
   */
  async _simulateHumanBehavior(page) {
    try {
      // Random scroll
      await page.evaluate(() => {
        window.scrollTo(0, Math.random() * 500);
      });
      
      // Wait a bit
      await page.waitForTimeout(1000 + Math.random() * 2000);
      
      // Scroll back up
      await page.evaluate(() => {
        window.scrollTo(0, 0);
      });
      
    } catch (error) {
      // Ignore errors in human simulation
    }
  }

  /**
   * Execute the visitor
   * @param {number} count - Number of iterations
   */
  async execute(count) {
    try {
      await this._initBrowser();
      
      console.log(`🎯 Starting ${count} iterations for ${this._urls.length} URLs`);
      console.log(`⏱️  Delay between requests: ${this._options.delay}ms`);
      console.log(`🕵️  Incognito mode: ${this._options.incognito ? 'Enabled' : 'Disabled'}`);
      console.log('---');
      
      for (let iteration = 0; iteration < count; iteration++) {
        console.log(`\n🔄 Iteration ${iteration + 1}/${count}`);
        
        for (const url of this._urls) {
          await this._visitUrl(url, iteration);
          
          // Add delay between requests
          if (this._options.delay > 0) {
            console.log(`⏳ Waiting ${this._options.delay}ms...`);
            await new Promise(resolve => setTimeout(resolve, this._options.delay));
          }
        }
      }
      
      console.log('\n🎉 All iterations completed successfully!');
      
    } catch (error) {
      console.error('❌ Error during execution:', error.message);
    } finally {
      if (this._browser) {
        await this._browser.close();
        console.log('🔒 Browser closed');
      }
    }
  }
}

export default HeadlessVisitor; 