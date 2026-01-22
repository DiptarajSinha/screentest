const fs = require('fs');
const open = require('open');

const generateReport = async (results) => {
  const heroShot = results.find(r => r.category.includes('Desktop')) || results[0];
  const heroPath = heroShot ? heroShot.currentPath.replace(/\\/g, '/') : '';

  const htmlContent = `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ScreenTest - Studio Report</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;800&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    
    <style>
      :root { --brand-red: #E50914; --bg-dark: #0f0f0f; --card-bg: #1f1f1f; --text-main: #ffffff; --text-sub: #a3a3a3; }
      * { box-sizing: border-box; }
      body { background-color: var(--bg-dark); color: var(--text-main); font-family: 'Inter', sans-serif; margin: 0; padding: 0; }

      /* HEADER */
      header {
        height: 300px;
        background-image: linear-gradient(to bottom, rgba(0,0,0,0.6), var(--bg-dark)), url('${heroPath}');
        background-size: cover;
        background-position: center top;
        display: flex; align-items: flex-end; padding: 40px 60px;
        border-bottom: 1px solid #333;
      }
      .header-content h1 { font-size: 3rem; margin: 0; font-weight: 800; letter-spacing: -1px; }
      .header-content p { color: var(--text-sub); font-size: 1.1rem; margin-top: 10px; }

      /* MAIN CONTAINER */
      main { max-width: 1600px; margin: 0 auto; padding: 40px 60px; }

      .section-title {
        font-size: 1.5rem; font-weight: 600; margin-top: 50px; margin-bottom: 25px;
        padding-bottom: 10px; border-bottom: 1px solid #333;
        display: flex; align-items: center; gap: 12px;
      }
      .section-title i { color: var(--brand-red); }

      /* --- LAYOUT CONTAINER --- */
      .card-container {
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
        gap: 40px;
      }

      /* --- ADAPTIVE CARD SIZING (The Fix) --- */
      .card { 
        background: var(--card-bg); border-radius: 12px; overflow: hidden;
        transition: all 0.3s ease; border: 1px solid #333; position: relative;
        box-shadow: 0 4px 6px rgba(0,0,0,0.3);
      }
      
      /* Mobile: Vertical Slice (Phone) - Stays compact */
      .card.mobile-card { 
        width: 280px; 
        flex-shrink: 0; 
      }
      
      /* Tablet: Mid-sized (iPad) */
      .card.tablet-card { 
        width: 600px; 
        max-width: 100%; 
      }
      
      /* Desktop: Widescreen Cinematic (Monitor) - Fills the space */
      .card.desktop-card { 
        width: 1000px; /* Huge width to simulate a real monitor */
        max-width: 100%; /* Responsive if screen is smaller */
      }

      /* --- IMAGE STACKING --- */
      .image-wrapper { position: relative; width: 100%; height: auto; }
      .img-base { width: 100%; display: block; }
      .img-diff { 
        position: absolute; top: 0; left: 0; width: 100%; height: 100%;
        opacity: 0; transition: opacity 0.2s ease; pointer-events: none;
      }
      .card:hover .img-diff { opacity: 1; }
      .card:hover { transform: translateY(-7px); box-shadow: 0 15px 30px rgba(0,0,0,0.5); border-color: #555; }

      /* META PANEL */
      .meta { padding: 15px 20px; background: #1a1a1a; border-top: 1px solid #333; }
      .status-badge {
        font-size: 0.75rem; font-weight: 800; text-transform: uppercase; letter-spacing: 1px;
        margin-bottom: 5px; display: inline-block; padding: 4px 8px; border-radius: 4px;
      }
      .status-match { color: #46d369; background: rgba(70, 211, 105, 0.1); }
      .status-mismatch { color: #ff4757; background: rgba(255, 71, 87, 0.1); }
      .status-new { color: #37bdf8; background: rgba(55, 189, 248, 0.1); }
      
      .device-name { font-size: 1rem; font-weight: 600; margin-top: 5px; }
      .diff-stat { color: var(--text-sub); font-size: 0.85rem; margin-top: 2px; }
    </style>
  </head>
  <body>
    <header>
      <div class="header-content">
        <h1>ScreenTest</h1>
        <p>Visual Regression Report</p>
      </div>
    </header>
    <main>
      ${generateLayout(results)}
    </main>
  </body>
  </html>
  `;

  fs.writeFileSync('report.html', htmlContent);
  console.log('🍿 Studio Report Ready! Opening...');
  await open('report.html');
};

function generateLayout(results) {
  const categories = {};
  results.forEach(r => {
    if (!categories[r.category]) categories[r.category] = [];
    categories[r.category].push(r);
  });

  return Object.keys(categories).map(cat => {
    let icon = 'fa-desktop';
    let cardClass = 'desktop-card'; // Default to Widescreen
    
    // Assign specific sizing classes based on category
    if (cat.includes('Mobile')) { icon = 'fa-mobile-screen'; cardClass = 'mobile-card'; }
    if (cat.includes('Tablet')) { icon = 'fa-tablet-screen-button'; cardClass = 'tablet-card'; }

    return `
    <div class="section-group">
      <div class="section-title"><i class="fa-solid ${icon}"></i> ${cat}</div>
      <div class="card-container">
        ${categories[cat].map(shot => {
          
          let badgeClass = 'status-match';
          let badgeText = 'Passing';
          let diffText = 'Pixel Perfect';
          let diffImgHTML = ''; 

          if (shot.status === 'Mismatch') {
            badgeClass = 'status-mismatch';
            badgeText = 'Regression';
            diffText = `${shot.mismatch}% Difference (Hover to see)`;
            diffImgHTML = `<img src="${shot.diffPath}" class="img-diff">`;
          } else if (shot.status === 'Baseline Created') {
            badgeClass = 'status-new';
            badgeText = 'New Baseline';
            diffText = 'Reference saved';
          }

          return `
          <div class="card ${cardClass}">
            <div class="image-wrapper">
              <img src="${shot.currentPath}" class="img-base" alt="${shot.actor}">
              ${diffImgHTML}
            </div>
            <div class="meta">
              <div class="status-badge ${badgeClass}">${badgeText}</div>
              <div class="device-name">${shot.actor}</div>
              <div class="diff-stat">${diffText}</div>
            </div>
          </div>
          `;
        }).join('')}
      </div>
    </div>
    `;
  }).join('');
}

module.exports = { generateReport };