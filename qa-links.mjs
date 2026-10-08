import playwright from '/home/agent/projects/Site-AS-Minsk/node_modules/playwright-core/index.js';
const { chromium } = playwright;
const browser = await chromium.launch({ executablePath: '/usr/bin/google-chrome', headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
const consoleErrors = [];
const requestFailures = [];
page.on('console', message => { if (message.type() === 'error') consoleErrors.push(message.text()); });
page.on('requestfailed', request => requestFailures.push(`${request.url()} ${request.failure()?.errorText || ''}`));
await page.goto(process.env.BASE_URL || 'https://archi-landing-iota.vercel.app/', { waitUntil: 'networkidle' });
await page.addStyleTag({ content: 'html{scroll-behavior:auto!important}' });

const results = [];
for (const selector of ['a[href="#main"]','a[href="#top"]','a[href="#system"]','a[href="#portfolio"]','a[href="#capabilities"]','a[href="#start"]']) {
  const link = page.locator(selector).first();
  const href = await link.getAttribute('href');
  await link.evaluate(element => element.click());
  await page.waitForTimeout(80);
  const id = href.slice(1);
  const targetVisible = await page.locator(`#${id}`).evaluate(element => {
    const box = element.getBoundingClientRect();
    return box.bottom > 0 && box.top < innerHeight;
  });
  results.push({ href, ok: targetVisible });
}

const hrefs = await page.locator('a').evaluateAll(links => links.map(link => link.getAttribute('href')));
for (const expected of [
  'mailto:as.creative2018world@gmail.com?subject=Новая%20задача%20для%20AI-архитектора%20ASC',
  'mailto:as.creative2018world@gmail.com',
  'https://t.me/DmitriBajda',
  'https://max.ru/u/f9LHodD0cOLPMJWfCE5NblW8kGItx5hcMws5Yu49O9Dwn6mp-wGRItE9IdA',
  'https://academy-strateg.by',
  'https://minsk-events-monitor.vercel.app',
  'https://academy-of-discoveries.vercel.app',
  'https://living-notebook-learning.vercel.app',
  'https://september-learning-quest.vercel.app',
  'https://projection-houses.vercel.app',
  'https://github.com/db5000-ux/projection-houses',
  'https://gnb-master.vercel.app/',
  'https://arlion-minsk.vercel.app'
]) results.push({ href: expected, ok: hrefs.includes(expected) });

console.log(JSON.stringify({ results, consoleErrors, requestFailures }, null, 2));
await browser.close();
if (results.some(result => !result.ok) || consoleErrors.length || requestFailures.length) process.exit(1);
