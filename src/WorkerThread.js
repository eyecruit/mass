import puppeteer from 'puppeteer';
import { parentPort, workerData } from 'worker_threads';

async function runWorker() {
  const { urls, options, workerId, iterations } = workerData;
  
  let browser = null;
  let context = null;

  try {
    // Initialize browser
    browser = await puppeteer.launch({
      headless: options.headless,
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

    if (options.incognito) {
      context = await browser.createIncognitoBrowserContext();
    } else {
      context = browser.defaultBrowserContext();
    }

    // Process iterations
    for (let iteration = 0; iteration < iterations; iteration++) {
      // Process all URLs concurrently
      const promises = urls.map(async (url) => {
        try {
          const page = await context.newPage();
          
          await page.setUserAgent(options.userAgent);
          await page.setViewport({ width: 1920, height: 1080 });
          await page.setJavaScriptEnabled(true);
          
          // Send progress message
          parentPort.postMessage({
            type: 'progress',
            url,
            iteration: iteration + 1
          });
          
          // Navigate with minimal wait
          await page.goto(url, { 
            waitUntil: 'domcontentloaded',
            timeout: 10000 
          });
          
          // Minimal wait
          await page.waitForTimeout(200);
          
          await page.close();
          
        } catch (error) {
          // Continue with other URLs even if one fails
        }
      });

      await Promise.all(promises);
    }

    // Send completion message
    parentPort.postMessage({ type: 'complete' });

  } catch (error) {
    console.error(`Worker ${workerId} error:`, error.message);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

// Run the worker
runWorker(); 