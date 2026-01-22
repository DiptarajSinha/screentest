const { devices } = require('playwright');

module.exports = {
  // The 'Actors' are the devices we want to test
  actors: [
    { 
      name: 'Mobile_Lead', 
      device: devices['iPhone 14'], 
      category: 'Mobile Originals' 
    },
    { 
      name: 'Tablet_Support', 
      device: devices['iPad Pro 11'], 
      category: 'Tablet Features' 
    },
    { 
      name: 'Desktop_Star', 
      viewport: { width: 1920, height: 1080 }, 
      category: 'Desktop Hits' 
    }
  ],
  // Where we save the screenshots
  outputDir: './dailies'
};