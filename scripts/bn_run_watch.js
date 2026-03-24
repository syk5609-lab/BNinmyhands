#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const { chromium } = require("playwright");

const url = process.argv[2] || "http://localhost:3000/";
const intervalSec = Number(process.argv[3] || 60);
const waitMs = Number(process.argv[4] || 4000);
const outDir = process.argv[5] || "./logs";
const maxChecks = process.argv[6] ? Number(process.argv[6]) : Infinity;

function nowIso() {
  return new Date().toISOString();
}

function normalize(v) {
  return (v || "").replace(/\s+/g, " ").trim();
}

function extractField(text, label) {
  const escaped = label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const patterns = [
    new RegExp(`${escaped}\\s*\\n\\s*([^\\n]+)`, "i"),
    new RegExp(`${escaped}\\s*:?\\s*([^\\n]+)`, "i"),
  ];
  for (const p of patterns) {
    const m = text.match(p);
    if (m && m[1]) return normalize(m[1]);
  }
  return "";
}

function extractState(text) {
  return {
    timeframe: extractField(text, "TIMEFRAME"),
    run_id: extractField(text, "RUN ID"),
    updated: extractField(text, "UPDATED"),
    data_age: extractField(text, "DATA AGE"),
    rows: extractField(text, "ROWS"),
    status: extractField(text, "STATUS"),
  };
}

function diffKeys(prev, curr) {
  const keys = Object.keys(curr);
  return keys.filter((k) => (prev?.[k] || "") !== (curr[k] || ""));
}

async function ensureCsv(csvPath) {
  if (!fs.existsSync(csvPath)) {
    fs.mkdirSync(path.dirname(csvPath), { recursive: true });
    fs.writeFileSync(
      csvPath,
      "timestamp,url,timeframe,run_id,updated,data_age,rows,status,changed_keys\n",
      "utf8"
    );
  }
}

async function appendCsv(csvPath, row) {
  const line = [
    row.timestamp,
    row.url,
    row.timeframe,
    row.run_id,
    row.updated,
    row.data_age,
    row.rows,
    row.status,
    row.changed_keys.join("|"),
  ]
    .map((v) => `"${String(v || "").replace(/"/g, '""')}"`)
    .join(",");
  fs.appendFileSync(csvPath, line + "\n", "utf8");
}

async function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

(async () => {
  const csvPath = path.resolve(outDir, "bn_run_watch_log.csv");
  await ensureCsv(csvPath);

  console.log("BN Run Watch starting...");
  console.log(`- URL: ${url}`);
  console.log(`- Interval: ${intervalSec}s`);
  console.log(`- Wait after load: ${waitMs}ms`);
  console.log(`- Log file: ${csvPath}`);
  console.log(`- Max checks: ${maxChecks === Infinity ? "∞" : maxChecks}`);

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 960 } });

  let previous = null;
  let count = 0;

  try {
    while (count < maxChecks) {
      count += 1;
      const timestamp = nowIso();

      let state = {
        timeframe: "",
        run_id: "",
        updated: "",
        data_age: "",
        rows: "",
        status: "",
      };

      try {
        await page.goto(url, { waitUntil: "domcontentloaded", timeout: 30000 });
        await page.waitForTimeout(waitMs);

        const bodyText = await page.locator("body").innerText();
        state = extractState(bodyText);
      } catch (err) {
        state.status = `ERROR: ${normalize(err.message).slice(0, 160)}`;
      }

      const changed = previous ? diffKeys(previous, state) : ["initial"];
      const changedLabel = changed.length ? changed.join("|") : "";

      await appendCsv(csvPath, {
        timestamp,
        url,
        ...state,
        changed_keys: changed,
      });

      const line =
        `${changed.length ? "🟢" : "•"} ` +
        `[${timestamp}] ` +
        `run_id=${state.run_id || "-"} | ` +
        `updated=${state.updated || "-"} | ` +
        `age=${state.data_age || "-"} | ` +
        `rows=${state.rows || "-"} | ` +
        `status=${state.status || "-"} ` +
        `${changed.length ? `| changed=${changedLabel}` : ""}`;

      console.log(line);

      previous = state;
      if (count < maxChecks) await sleep(intervalSec * 1000);
    }
  } finally {
    await browser.close();
  }
})();
