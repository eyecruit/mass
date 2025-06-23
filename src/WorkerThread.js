import puppeteer from 'puppeteer';
import { parentPort, workerData } from 'worker_threads';

async function runWorker() {
  const { urls, options, workerId, iterations } = workerData;
  
  let browser = null;

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

    // Process iterations - each iteration gets a new incognito window
    for (let iteration = 0; iteration < iterations; iteration++) {
      let context = null;
      
      try {
        // Create new incognito context for each iteration
        context = await browser.createIncognitoBrowserContext();
        
        // Send window creation message
        parentPort.postMessage({
          type: 'window',
          action: 'Created new',
          iteration: iteration + 1
        });

        // Create multiple tabs for all URLs in this iteration
        const pagePromises = urls.map(async (url, urlIndex) => {
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
            
            // Don't close individual pages - let the context handle it
            
          } catch (error) {
            // Continue with other URLs even if one fails
          }
        });

        // Wait for all tabs to complete
        await Promise.all(pagePromises);
        
        // Send window completion message
        parentPort.postMessage({
          type: 'window',
          action: 'Completed',
          iteration: iteration + 1
        });

      } finally {
        // Close the entire incognito context (all tabs) for this iteration
        if (context) {
          await context.close();
          
          // Send window close message
          parentPort.postMessage({
            type: 'window',
            action: 'Closed',
            iteration: iteration + 1
          });
        }
      }
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