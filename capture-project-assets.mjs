import playwright from '/home/agent/projects/Site-AS-Minsk/node_modules/playwright-core/index.js';

const { chromium } = playwright;
const projects = [
  ['academy-strateg', 'https://academy-strateg.by'],
  ['minsk-events', 'https://minsk-events-monitor.vercel.app'],
  ['academy-discoveries', 'https://academy-of-discoveries.vercel.app'],
  ['living-notebook', 'https://living-notebook-learning.vercel.app'],
  ['learning-quest', 'https://september-learning-quest.vercel.app'],
  ['projection-houses', 'https://projection-houses.vercel.app'],
];

const browser = await chromium.launch({ executablePath: '/usr/bin/google-chrome', headless: true });
for (const [name, url] of projects) {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
  await page.goto(url, { waitUntil: 'networkidle', timeout: 45000 });
  await page.screenshot({ path: `assets/${name}-source.png` });
  console.log(`${name}: ${await page.title()}`);
  await page.close();
}
await browser.close();
