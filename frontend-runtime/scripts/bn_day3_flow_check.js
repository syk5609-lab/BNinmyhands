/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const baseUrl = process.argv[2] || 'http://localhost:3000/';
const logsDir = path.resolve(process.cwd(), process.argv[3] || '../logs/day3');
const settleMs = Number(process.argv[4] || 2500);
const timeframes = ['1h', '4h', '24h'];

const strongUnavailableKeywords = [
  'run not found',
  'invalid run',
  'context mismatch',
  'requested run is unavailable',
  '요청한 run',
  'run을 찾을 수 없습니다',
  'context가 맞지 않습니다',
  '문맥이 맞지 않습니다',
];

const weakUnavailableKeywords = [
  'unavailable',
  'not available',
  'no data',
  '데이터가 없습니다',
  '찾을 수 없습니다',
  '사용할 수 없습니다',
];

const results = [];
const validSeeds = {};

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function nowStamp() {
  return new Date().toISOString().replace(/[:.]/g, '-');
}

function buildUrl(pathname, params = {}) {
  const url = new URL(pathname, baseUrl);
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== '') {
      url.searchParams.set(key, String(value));
    }
  }
  return url.toString();
}

function parseDetailUrl(rawUrl, fallbackTimeframe = '') {
  const url = new URL(rawUrl, baseUrl);
  const parts = url.pathname.split('/').filter(Boolean);
  return {
    href: url.toString(),
    symbol: decodeURIComponent(parts[1] || ''),
    timeframe: url.searchParams.get('timeframe') || fallbackTimeframe || '',
    runId: url.searchParams.get('run_id') || '',
  };
}

function containsAny(text, keywords) {
  return keywords.some((word) => text.includes(word));
}

async function waitForSettled(page) {
  await page.waitForLoadState('domcontentloaded').catch(() => {});
  await page.waitForTimeout(settleMs);
  await page.waitForLoadState('networkidle', { timeout: 5000 }).catch(() => {});
  await page.waitForTimeout(500);
}

async function getBodyText(page) {
  const body = page.locator('body');
  const text = await body.innerText().catch(() => '');
  return String(text || '').toLowerCase();
}

async function getStructureSignals(page) {
  return page
    .evaluate(() => {
      const counts = {
        headings: document.querySelectorAll('h1, h2, h3').length,
        buttons: document.querySelectorAll('button').length,
        tables: document.querySelectorAll('table, [role="table"]').length,
        links: document.querySelectorAll('a').length,
        charts: document.querySelectorAll('svg, canvas').length,
        sections: document.querySelectorAll('section, article, main').length,
      };
      return Object.values(counts).reduce((sum, value) => sum + value, 0);
    })
    .catch(() => 0);
}

async function collectCoinLinks(page, fallbackTimeframe = '') {
  const raw = await page.evaluate(() => {
    const anchors = Array.from(document.querySelectorAll('a[href*="/coin/"]'));
    const out = [];
    const seen = new Set();

    anchors.forEach((anchor, index) => {
      const href = anchor.href;
      if (!href || seen.has(href)) return;
      seen.add(href);
      out.push({
        index,
        href,
        text: (anchor.textContent || '').trim().replace(/\s+/g, ' '),
      });
    });

    return out;
  });

  return raw
    .map((item) => ({ ...item, ...parseDetailUrl(item.href, fallbackTimeframe) }))
    .filter((item) => item.symbol);
}

async function tryTimeframeClick(page, timeframe) {
  const attempts = [
    async () =>
      page
        .getByRole('button', { name: new RegExp(`^${timeframe}$`, 'i') })
        .first()
        .click({ timeout: 1500 }),
    async () =>
      page
        .getByRole('button', { name: new RegExp(`^${timeframe.toUpperCase()}$`, 'i') })
        .first()
        .click({ timeout: 1500 }),
    async () =>
      page
        .getByRole('link', { name: new RegExp(`^${timeframe}$`, 'i') })
        .first()
        .click({ timeout: 1500 }),
    async () =>
      page
        .locator(`text=${timeframe}`)
        .first()
        .click({ timeout: 1500 }),
    async () =>
      page
        .locator(`text=${timeframe.toUpperCase()}`)
        .first()
        .click({ timeout: 1500 }),
  ];

  for (const attempt of attempts) {
    try {
      await attempt();
      await waitForSettled(page);
      return true;
    } catch {
      // next selector
    }
  }
  return false;
}

async function waitForCoinLinks(page, timeframe, minCount = 1, retries = 3) {
  for (let i = 0; i < retries; i += 1) {
    const links = await collectCoinLinks(page, timeframe);
    if (links.length >= minCount) return links;
    await page.waitForTimeout(1200);
  }
  return collectCoinLinks(page, timeframe);
}

async function openDashboardForTimeframe(page, timeframe) {
  await page.goto(buildUrl('/', { timeframe }), { waitUntil: 'domcontentloaded' });
  await waitForSettled(page);

  let links = await waitForCoinLinks(page, timeframe, 1, 3);
  if (links.length >= 1) return { links, source: 'direct' };

  const clicked = await tryTimeframeClick(page, timeframe);
  links = await waitForCoinLinks(page, timeframe, 1, 3);
  if (links.length >= 1) return { links, source: clicked ? 'clicked-tab' : 'post-click-retry' };

  await page.reload({ waitUntil: 'domcontentloaded' }).catch(() => {});
  await waitForSettled(page);
  links = await waitForCoinLinks(page, timeframe, 1, 3);
  if (links.length >= 1) return { links, source: 'reload' };

  return { links: [], source: 'no-links' };
}

async function takeShot(page, name) {
  const file = path.join(logsDir, `${nowStamp()}-${name}.png`);
  await page.screenshot({ path: file, fullPage: true });
  return file;
}

async function inspectDetail(page, expected) {
  const current = new URL(page.url());
  const bodyText = await getBodyText(page);
  const structureSignals = await getStructureSignals(page);
  const hasSymbol = bodyText.includes(expected.symbol.toLowerCase());
  const strongUnavailable = containsAny(bodyText, strongUnavailableKeywords);
  const weakUnavailable = containsAny(bodyText, weakUnavailableKeywords);

  const unavailable = strongUnavailable || (weakUnavailable && !hasSymbol && structureSignals < 8);

  const samePath = current.pathname.toLowerCase().includes(`/coin/${expected.symbol.toLowerCase()}`);
  const sameTimeframe = current.searchParams.get('timeframe') === expected.timeframe;
  const sameRunId = current.searchParams.get('run_id') === expected.runId;
  const bodyLongEnough = bodyText.length > 500;

  return {
    pass: samePath && sameTimeframe && sameRunId && bodyLongEnough && !unavailable,
    currentUrl: current.toString(),
    unavailable,
    hasSymbol,
    bodyLength: bodyText.length,
    bodyExcerpt: bodyText.slice(0, 280),
    structureSignals,
    samePath,
    sameTimeframe,
    sameRunId,
  };
}

async function inspectUnavailable(page) {
  const bodyText = await getBodyText(page);
  const structureSignals = await getStructureSignals(page);
  const strongUnavailable = containsAny(bodyText, strongUnavailableKeywords);
  const weakUnavailable = containsAny(bodyText, weakUnavailableKeywords);

  return {
    pass: strongUnavailable || (weakUnavailable && structureSignals < 8),
    bodyLength: bodyText.length,
    structureSignals,
    currentUrl: page.url(),
    bodyExcerpt: bodyText.slice(0, 280),
  };
}

function record(result) {
  results.push(result);
  console.log(`${result.pass ? 'PASS' : result.blocker ? 'FAIL' : 'SKIP'} | ${result.caseName} | ${result.note}`);
}

async function runValidCase(page, timeframe) {
  const dashboardUrl = buildUrl('/', { timeframe });
  const dashboard = await openDashboardForTimeframe(page, timeframe);
  const dashboardShot = await takeShot(page, `dashboard-${timeframe}`);

  if (dashboard.links.length === 0) {
    record({
      caseName: `valid-${timeframe}`,
      pass: false,
      blocker: false,
      note: `${timeframe} dashboard에서 /coin/ 링크가 0개입니다. 현재 데이터 부족 또는 selector 확인 필요`,
      startUrl: dashboardUrl,
      clickedSymbol: '',
      expected: 'at least 1 candidate exists for timeframe',
      actual: JSON.stringify({ source: dashboard.source, links: 0 }),
      screenshots: [dashboardShot],
    });
    return;
  }

  const first = dashboard.links[0];
  const second = dashboard.links.find((item) => item.symbol !== first.symbol) || dashboard.links[1] || null;

  validSeeds[timeframe] = first;

  await page.goto(first.href, { waitUntil: 'domcontentloaded' });
  await waitForSettled(page);
  const firstCheck = await inspectDetail(page, first);
  const firstShot = await takeShot(page, `detail-${timeframe}-first-${first.symbol}`);

  await page.goBack({ waitUntil: 'domcontentloaded' }).catch(async () => {
    await page.goto(dashboardUrl, { waitUntil: 'domcontentloaded' });
  });
  await waitForSettled(page);

  const backLinks = await waitForCoinLinks(page, timeframe, 1, 3);
  const currentAfterBack = new URL(page.url());
  const backBodyText = await getBodyText(page);
  const backOk =
    currentAfterBack.pathname === '/' &&
    currentAfterBack.searchParams.get('timeframe') === timeframe &&
    backLinks.length >= 1;
  const backShot = await takeShot(page, `dashboard-${timeframe}-after-back`);

  let secondCheck = null;
  let secondShot = null;
  if (second) {
    await page.goto(second.href, { waitUntil: 'domcontentloaded' });
    await waitForSettled(page);
    secondCheck = await inspectDetail(page, second);
    secondShot = await takeShot(page, `detail-${timeframe}-second-${second.symbol}`);
  }

  const pass = firstCheck.pass && backOk && (second ? secondCheck.pass : true);

  record({
    caseName: `valid-${timeframe}`,
    pass,
    blocker: !pass,
    note: second
      ? `first=${first.symbol} second=${second.symbol} run_id=${first.runId} timeframe=${timeframe}`
      : `first=${first.symbol} only-candidate run_id=${first.runId} timeframe=${timeframe}`,
    startUrl: dashboardUrl,
    clickedSymbol: second ? `${first.symbol} -> ${second.symbol}` : first.symbol,
    expected:
      'detail URL keeps run_id/timeframe, back returns to dashboard, and available second candidate also opens in same context',
    actual: JSON.stringify({
      source: dashboard.source,
      firstCheck,
      backOk,
      backUrl: currentAfterBack.toString(),
      backLinkCount: backLinks.length,
      backBodyExcerpt: backBodyText.slice(0, 280),
      secondCheck,
    }),
    screenshots: [dashboardShot, firstShot, backShot].concat(secondShot ? [secondShot] : []),
  });
}

async function runInvalidCase(page) {
  const seed = validSeeds['1h'] || Object.values(validSeeds)[0];
  if (!seed) {
    record({
      caseName: 'invalid-run',
      pass: false,
      blocker: false,
      note: 'invalid-run 테스트용 seed가 없습니다',
      startUrl: '',
      clickedSymbol: '',
      expected: 'a valid seed exists from prior timeframe checks',
      actual: '',
      screenshots: [],
    });
    return;
  }

  const invalidUrl = buildUrl(`/coin/${seed.symbol}`, {
    timeframe: seed.timeframe,
    run_id: 999999999,
  });

  await page.goto(invalidUrl, { waitUntil: 'domcontentloaded' });
  await waitForSettled(page);
  const check = await inspectUnavailable(page);
  const shot = await takeShot(page, 'invalid-run');

  record({
    caseName: 'invalid-run',
    pass: check.pass,
    blocker: !check.pass,
    note: `symbol=${seed.symbol} timeframe=${seed.timeframe} invalid run_id=999999999`,
    startUrl: invalidUrl,
    clickedSymbol: seed.symbol,
    expected: 'approved unavailable state appears',
    actual: JSON.stringify(check),
    screenshots: [shot],
  });
}

async function runMismatchCase(page) {
  const seeds = Object.values(validSeeds).filter(Boolean);
  const first = validSeeds['1h'] || seeds[0];
  const second = seeds.find((item) => item.runId && item.runId !== first?.runId);

  if (!first || !second) {
    record({
      caseName: 'mismatch-context',
      pass: false,
      blocker: false,
      note: '서로 다른 run_id seed가 부족해서 mismatch-context를 생성하지 못했습니다',
      startUrl: '',
      clickedSymbol: '',
      expected: 'two different valid seeds exist',
      actual: JSON.stringify({ availableSeeds: seeds }),
      screenshots: [],
    });
    return;
  }

  const mismatchUrl = buildUrl(`/coin/${first.symbol}`, {
    timeframe: first.timeframe,
    run_id: second.runId,
  });

  await page.goto(mismatchUrl, { waitUntil: 'domcontentloaded' });
  await waitForSettled(page);
  const check = await inspectUnavailable(page);
  const shot = await takeShot(page, 'mismatch-context');

  record({
    caseName: 'mismatch-context',
    pass: check.pass,
    blocker: !check.pass,
    note: `symbol=${first.symbol} timeframe=${first.timeframe} mismatched run_id=${second.runId}`,
    startUrl: mismatchUrl,
    clickedSymbol: first.symbol,
    expected: 'approved unavailable state appears',
    actual: JSON.stringify(check),
    screenshots: [shot],
  });
}

function writeReports() {
  const jsonFile = path.join(logsDir, 'day3-summary.json');
  const csvFile = path.join(logsDir, 'day3-summary.csv');

  fs.writeFileSync(jsonFile, JSON.stringify(results, null, 2), 'utf8');

  const header = [
    'caseName',
    'pass',
    'blocker',
    'note',
    'startUrl',
    'clickedSymbol',
    'expected',
    'actual',
    'screenshots',
  ];

  const rows = [
    header.join(','),
    ...results.map((row) =>
      header
        .map((key) => {
          const value = Array.isArray(row[key]) ? row[key].join(' | ') : String(row[key] ?? '');
          return `"${value.replaceAll('"', '""')}"`;
        })
        .join(',')
    ),
  ];

  fs.writeFileSync(csvFile, rows.join('\n'), 'utf8');

  const passCount = results.filter((item) => item.pass).length;
  const failCount = results.filter((item) => !item.pass && item.blocker).length;
  const skipCount = results.filter((item) => !item.pass && !item.blocker).length;

  console.log('\n=== Day 3 Summary ===');
  console.log(`PASS: ${passCount}`);
  console.log(`FAIL: ${failCount}`);
  console.log(`SKIP: ${skipCount}`);
  console.log(`JSON: ${jsonFile}`);
  console.log(`CSV : ${csvFile}`);

  if (failCount > 0) process.exitCode = 1;
}

(async () => {
  ensureDir(logsDir);
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1100 } });

  try {
    for (const timeframe of timeframes) {
      await runValidCase(page, timeframe);
    }
    await runInvalidCase(page);
    await runMismatchCase(page);
  } catch (error) {
    const shot = await takeShot(page, 'fatal-error').catch(() => null);
    record({
      caseName: 'fatal-error',
      pass: false,
      blocker: true,
      note: error.message,
      startUrl: page.url(),
      clickedSymbol: '',
      expected: 'script completes all day 3 cases',
      actual: String(error.stack || error),
      screenshots: shot ? [shot] : [],
    });
    process.exitCode = 1;
  } finally {
    writeReports();
    await browser.close();
  }
})();
