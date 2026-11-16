// Prints resume/resume.html to public/Shima-Azimi-Resume.pdf with a local Chrome or Edge.
// Usage: npm i --no-save puppeteer-core && node resume/build.js
const fs = require('fs');
const path = require('path');
const { pathToFileURL } = require('url');
const puppeteer = require('puppeteer-core');

const browsers = [
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  '/usr/bin/google-chrome',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
];

(async () => {
  const executablePath = browsers.find(p => fs.existsSync(p));
  if (!executablePath) throw new Error('No Chrome or Edge found');
  const browser = await puppeteer.launch({ executablePath, headless: 'new' });
  const page = await browser.newPage();
  await page.goto(pathToFileURL(path.join(__dirname, 'resume.html')).href, { waitUntil: 'load' });
  const out = path.join(__dirname, '..', 'public', 'Shima-Azimi-Resume.pdf');
  // Real text and a tagged structure, so applicant tracking systems read it in order
  await page.pdf({ path: out, preferCSSPageSize: true, printBackground: true, tagged: true, outline: false });
  await browser.close();
  console.log('Wrote', out);
})().catch(e => { console.error(e); process.exit(1); });
