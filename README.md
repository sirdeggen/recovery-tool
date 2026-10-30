# Derivation scan

A single offline page that checks whether a BSV Browser recovery phrase can produce a given address.
It shows only "match" (with the derivation path) or "no match". It never shows, stores or sends a key.

**Live page:** https://sirdeggen.github.io/recovery-tool/

## Safety

- The page has a Content-Security-Policy with `connect-src 'none'`, so it cannot make any network request.
- All work runs in the browser tab. Nothing leaves the device.
- For the most safety, save the page, disconnect from the internet, and open the saved copy.

## What it checks

About 10,500 addresses that one phrase can produce:

- The BSV Browser address-receive key (BRC-42, protocol `[2, '3241645161d8']`, keyID `base64(YYYY-MM-DD) + ' ' + base64('legacy')`) for each day from 1 July to 31 October 2026, on roots `m/0'/n'`, `m/1'/n'` (n = 0–9) and the master key.
- The plain P2PKH addresses of the master key, `m/0'/n'` and `m/1'/n'`.
- The first 20 addresses of `m/44'/236'/0'`, `m/44'/0'/0'`, `m/44'/145'/0'`, `m/0` and `m/0'` (external and change chains).

## Build

`index.html` is generated. To rebuild it from source:

```bash
npm install
npm run build
```

The source is `src/scan.js` (scan logic) and `src/template.html` (page). `@bsv/sdk` is pinned to 2.8.11.
