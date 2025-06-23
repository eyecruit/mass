import puppeteer from 'puppeteer';

class HeadlessVisitor {
  /**
   * @param {string[]} urls - Array of URLs to visit
   * @param {Object} options - Configuration options
   * @param {boolean} options.incognito - Whether to use incognito mode
   * @param {boolean} options.headless - Whether to run in headless mode
   * @param {string} options.userAgent - Custom user agent string
   * @param {number} options.concurrentPages - Number of concurrent pages to use
   */
  constructor(urls, options = {}) {
    if (!urls || urls.length === 0) {
      throw new Error('URLs cannot be empty!');
    }

    this._urls = urls;
    this._options = {
      incognito: options.incognito || false,
      headless: options.headless !== false, // Default to true for VPS
      userAgent: options.userAgent || 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      concurrentPages: options.concurrentPages || 5 // Number of concurrent pages
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
        '--disable-ipc-flooding-protection',
        '--disable-web-security',
        '--disable-features=VizDisplayCompositor'
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
      
      // Navigate to the URL with minimal wait
      await page.goto(url, { 
        waitUntil: 'domcontentloaded', // Faster than networkidle2
        timeout: 15000 
      });
      
      // Minimal wait for page load
      await page.waitForTimeout(500);
      
      console.log(`✅ Successfully visited: ${url}`);
      
      // Close the page immediately
      await page.close();
      
    } catch (error) {
      console.error(`❌ Error visiting ${url}:`, error.message);
    }
  }

  /**
   * Process URLs in batches with concurrency
   * @param {string[]} urls - URLs to process
   * @param {number} iteration - Current iteration number
   */
  async _processUrlBatch(urls, iteration) {
    const promises = urls.map((url, index) => 
      this._visitUrl(url, iteration)
    );
    
    await Promise.all(promises);
  }

  /**
   * Execute the visitor with maximum speed
   * @param {number} count - Number of iterations
   */
  async execute(count) {
    try {
      await this._initBrowser();
      
      console.log(`🎯 Starting ${count} iterations for ${this._urls.length} URLs`);
      console.log(`⚡ Concurrent pages: ${this._options.concurrentPages}`);
      console.log(`🕵️  Incognito mode: ${this._options.incognito ? 'Enabled' : 'Disabled'}`);
      console.log('🚀 Running at maximum speed - NO DELAYS');
      console.log('---');
      
      for (let iteration = 0; iteration < count; iteration++) {
        console.log(`\n🔄 Iteration ${iteration + 1}/${count}`);
        
        // Process all URLs concurrently
        await this._processUrlBatch(this._urls, iteration);
      }
      
      console.log('\n🎉 All iterations completed at maximum speed!');
      
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