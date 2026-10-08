import playwright from '/home/agent/projects/Site-AS-Minsk/node_modules/playwright-core/index.js';
const { chromium } = playwright;
const baseUrl = process.env.BASE_URL || 'http://127.0.0.1:4173/';
const screenshotPrefix = process.env.SCREENSHOT_PREFIX || 'v5';

const browser = await chromium.launch({ executablePath: '/usr/bin/google-chrome', headless: true });
const viewports = [
  { name: 'desktop', width: 1440, height: 1000 },
  { name: 'mobile', width: 390, height: 844 },
];
let failed = false;

for (const viewport of viewports) {
  const page = await browser.newPage({ viewport });
  const errors = [];
  const requestFailures = [];
  page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
  page.on('pageerror', error => errors.push(error.message));
  page.on('requestfailed', request => requestFailures.push(`${request.url()} ${request.failure()?.errorText || ''}`));
  await page.goto(baseUrl, { waitUntil: 'networkidle' });
  for (const image of await page.locator('img').all()) {
    await image.scrollIntoViewIfNeeded();
    await page.waitForTimeout(80);
  }
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForLoadState('networkidle');
  await page.screenshot({ path: `screenshots/${screenshotPrefix}-${viewport.name}.png`, fullPage: true });
  await page.locator('.wide-visual').screenshot({ path: `screenshots/${screenshotPrefix}-${viewport.name}-wide-visual.png` });
  await page.locator('.process').screenshot({ path: `screenshots/${screenshotPrefix}-${viewport.name}-process.png` });
  await page.locator('.project-stream').screenshot({ path: `screenshots/${screenshotPrefix}-${viewport.name}-portfolio.png` });
  await page.locator('.systems').screenshot({ path: `screenshots/${screenshotPrefix}-${viewport.name}-systems.png` });
  await page.locator('.closing').screenshot({ path: `screenshots/${screenshotPrefix}-${viewport.name}-contacts.png` });
  const result = await page.evaluate(() => ({
    title: document.title,
    viewport: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
    images: [...document.images].map(img => ({
      src: img.getAttribute('src'),
      complete: img.complete,
      natural: [img.naturalWidth, img.naturalHeight],
      shown: [Math.round(img.getBoundingClientRect().width), Math.round(img.getBoundingClientRect().height)],
    })),
    processRenders: document.querySelectorAll('.process-visual img').length,
    projects: document.querySelectorAll('.project-stream > .project').length,
    educationVariants: document.querySelectorAll('.project-variants a').length,
    educationPreviews: document.querySelectorAll('.project-triptych img').length,
    solutionCards: document.querySelectorAll('.solution-paths article').length,
    controlCopy: document.body.innerText.includes('Контроль остаётся у вас'),
    email: document.querySelector('.start-link')?.getAttribute('href'),
    max: document.querySelector('.contact-links a[href^="https://max.ru/"]')?.href,
    telegram: document.querySelector('.contact-links a[href^="https://t.me/"]')?.href,
  }));
  const ok = result.scrollWidth === result.viewport && result.images.every(image => image.complete && image.natural[0] > 0) && result.processRenders === 3 && result.projects === 7 && result.educationVariants === 3 && result.educationPreviews === 3 && result.solutionCards === 4 && result.controlCopy && result.email?.includes('as.creative2018world@gmail.com') && result.max && result.telegram && errors.length === 0 && requestFailures.length === 0;
  if (!ok) failed = true;
  console.log(JSON.stringify({ viewport: viewport.name, ok, result, errors, requestFailures }, null, 2));
  await page.close();
}

await browser.close();
if (failed) process.exit(1);
