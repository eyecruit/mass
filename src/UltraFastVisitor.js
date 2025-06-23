import puppeteer from 'puppeteer';
import { Worker, isMainThread, parentPort, workerData } from 'worker_threads';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

class UltraFastVisitor {
  /**
   * @param {string[]} urls - Array of URLs to visit
   * @param {Object} options - Configuration options
   * @param {boolean} options.incognito - Whether to use incognito mode
   * @param {boolean} options.headless - Whether to run in headless mode
   * @param {string} options.userAgent - Custom user agent string
   * @param {number} options.workers - Number of worker threads
   * @param {number} options.concurrentPages - Number of concurrent pages per worker
   */
  constructor(urls, options = {}) {
    if (!urls || urls.length === 0) {
      throw new Error('URLs cannot be empty!');
    }

    this._urls = urls;
    this._options = {
      incognito: options.incognito || false,
      headless: options.headless !== false,
      userAgent: options.userAgent || 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      workers: options.workers || 4, // Number of worker threads
      concurrentPages: options.concurrentPages || 5 // Pages per worker
    };
  }

  /**
   * Split URLs among workers
   * @param {string[]} urls - URLs to split
   * @param {number} workers - Number of workers
   */
  _splitUrlsForWorkers(urls, workers) {
    const chunks = [];
    const chunkSize = Math.ceil(urls.length / workers);
    
    for (let i = 0; i < urls.length; i += chunkSize) {
      chunks.push(urls.slice(i, i + chunkSize));
    }
    
    return chunks;
  }

  /**
   * Create and run a worker
   * @param {string[]} workerUrls - URLs for this worker
   * @param {number} workerId - Worker ID
   * @param {number} iterations - Number of iterations
   */
  _createWorker(workerUrls, workerId, iterations) {
    return new Promise((resolve, reject) => {
      const worker = new Worker(join(__dirname, 'WorkerThread.js'), {
        workerData: {
          urls: workerUrls,
          options: this._options,
          workerId,
          iterations
        }
      });

      worker.on('message', (message) => {
        if (message.type === 'progress') {
          console.log(`👷 Worker ${workerId}: ${message.url} (Iteration ${message.iteration})`);
        } else if (message.type === 'complete') {
          console.log(`✅ Worker ${workerId} completed`);
        } else if (message.type === 'window') {
          console.log(`🪟 Worker ${workerId}: ${message.action} incognito window (Iteration ${message.iteration})`);
        }
      });

      worker.on('error', reject);
      worker.on('exit', (code) => {
        if (code !== 0) {
          reject(new Error(`Worker ${workerId} stopped with exit code ${code}`));
        } else {
          resolve();
        }
      });
    });
  }

  /**
   * Execute with maximum speed using worker threads
   * @param {number} count - Number of iterations
   */
  async execute(count) {
    console.log('🚀 Starting Ultra-Fast Visitor with Worker Threads');
    console.log(`🎯 ${count} iterations for ${this._urls.length} URLs`);
    console.log(`⚡ ${this._options.workers} workers, ${this._options.concurrentPages} pages per worker`);
    console.log(`🕵️  Incognito mode: ${this._options.incognito ? 'Enabled' : 'Disabled'}`);
    console.log('🪟 NEW WINDOW PER ITERATION - MULTIPLE TABS - AUTO CLOSE');
    console.log('🚀 MAXIMUM SPEED - NO DELAYS - MULTITHREADED');
    console.log('---');

    const startTime = Date.now();

    try {
      // Split URLs among workers
      const urlChunks = this._splitUrlsForWorkers(this._urls, this._options.workers);
      
      // Create workers
      const workerPromises = urlChunks.map((urls, index) => 
        this._createWorker(urls, index + 1, count)
      );

      // Wait for all workers to complete
      await Promise.all(workerPromises);

      const endTime = Date.now();
      const duration = (endTime - startTime) / 1000;

      console.log('\n🎉 All workers completed successfully!');
      console.log(`⏱️  Total time: ${duration.toFixed(2)} seconds`);
      console.log(`📊 Average: ${(this._urls.length * count / duration).toFixed(2)} URLs/second`);

    } catch (error) {
      console.error('❌ Error during execution:', error.message);
    }
  }
}

export default UltraFastVisitor; 