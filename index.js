#!/usr/bin/env node
const { Command } = require('commander');
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const PNG = require('pngjs').PNG;
const pixelmatch = require('pixelmatch');
const config = require('./config');
const { generateReport } = require('./reporter');

const program = new Command();

program
  .name('screentest')
  .description('Cinematic Visual Regression Tool')
  .version('1.0.0');

program
  .command('audition')
  .description('Run visual tests')
  .requiredOption('-u, --url <type>', 'URL to test')
  .option('--update', 'Force update baselines')
  .action(async (options) => {
    console.log(chalk.red.bold('\n🎬 ACTION! Starting ScreenTest...\n'));
    
    const browser = await chromium.launch();
    const results = [];
    
    // Create directories
    const dirs = {
      baseline: './screentest/baseline',
      current: './screentest/current',
      diff: './screentest/diff'
    };
    Object.values(dirs).forEach(d => { if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true }); });

    for (const actor of config.actors) {
      process.stdout.write(chalk.white(`  🎥 Filming ${actor.name}... `));
      
      const context = await browser.newContext(actor.device || { viewport: actor.viewport });
      const page = await context.newPage();
      await page.goto(options.url, { waitUntil: 'networkidle' });
      
      const filename = `${actor.name}.png`;
      const baselinePath = path.join(dirs.baseline, filename);
      const currentPath = path.join(dirs.current, filename);
      const diffPath = path.join(dirs.diff, filename);

      await page.screenshot({ path: currentPath, fullPage: true });

      let status = 'New';
      let mismatch = 0;

      // COMPARE LOGIC
      if (fs.existsSync(baselinePath) && !options.update) {
        const img1 = PNG.sync.read(fs.readFileSync(baselinePath));
        const img2 = PNG.sync.read(fs.readFileSync(currentPath));
        const { width, height } = img1;
        const diff = new PNG({ width, height });

        // threshold: 0.2 ignores tiny anti-aliasing noise (prevents false blur)
        // alpha: 0 creates a transparent diff (only red pixels), perfect for overlaying
        const numDiffPixels = pixelmatch(img1.data, img2.data, diff.data, width, height, { threshold: 0.2, alpha: 0, diffColor: [255, 0, 0] });
        mismatch = ((numDiffPixels / (width * height)) * 100).toFixed(2);

        if (numDiffPixels > 0) {
          fs.writeFileSync(diffPath, PNG.sync.write(diff));
          status = 'Mismatch';
        } else {
          status = 'Match';
        }
      } else {
        fs.copyFileSync(currentPath, baselinePath);
        status = 'Baseline Created';
      }

      results.push({ 
        actor: actor.name, 
        currentPath: currentPath,  // The Crisp Image
        diffPath: diffPath,        // The Red Overlay (only used if mismatch)
        category: actor.category,
        status: status,
        mismatch: mismatch
      });

      if (status === 'Match') console.log(chalk.green('CUT! (Perfect Match) ✅'));
      else if (status === 'Mismatch') console.log(chalk.red(`CUT! (Diff: ${mismatch}%) ❌`));
      else console.log(chalk.blue('CUT! (New Baseline) 📸'));
      
      await context.close();
    }

    await browser.close();
    console.log(chalk.red.bold('\n🎞️  Wrapping production...'));
    await generateReport(results);
  });

program.parse(process.argv);