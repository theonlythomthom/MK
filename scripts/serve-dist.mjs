#!/usr/bin/env node
import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';
import { spawn } from 'node:child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '..');
const distDir = path.join(projectRoot, 'dist');
const args = new Set(process.argv.slice(2));
const port = Number(process.env.PORT || 4173);
const host = '127.0.0.1';

function contentType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  return {
    '.html': 'text/html; charset=utf-8',
    '.js': 'text/javascript; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.svg': 'image/svg+xml',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.webp': 'image/webp',
    '.ico': 'image/x-icon',
    '.map': 'application/json; charset=utf-8',
    '.txt': 'text/plain; charset=utf-8'
  }[ext] || 'application/octet-stream';
}

async function resolveFile(urlPath) {
  const safePath = decodeURIComponent(urlPath.split('?')[0]).replace(/^\/+/, '');
  const candidate = path.join(distDir, safePath || 'index.html');
  const normalized = path.normalize(candidate);
  if (!normalized.startsWith(distDir)) {
    return null;
  }
  try {
    const stat = await fs.stat(normalized);
    if (stat.isDirectory()) {
      return path.join(normalized, 'index.html');
    }
    return normalized;
  } catch {
    return path.join(distDir, 'index.html');
  }
}

async function openBrowser(url) {
  const platform = process.platform;
  if (platform === 'win32') {
    spawn('cmd', ['/c', 'start', '', url], { detached: true, stdio: 'ignore' }).unref();
    return;
  }
  if (platform === 'darwin') {
    spawn('open', [url], { detached: true, stdio: 'ignore' }).unref();
    return;
  }
  spawn('xdg-open', [url], { detached: true, stdio: 'ignore' }).unref();
}

const server = http.createServer(async (req, res) => {
  try {
    const filePath = await resolveFile(req.url || '/');
    if (!filePath) {
      res.writeHead(403);
      res.end('Forbidden');
      return;
    }
    const data = await fs.readFile(filePath);
    res.writeHead(200, { 'Content-Type': contentType(filePath), 'Cache-Control': 'no-store' });
    res.end(data);
  } catch (error) {
    res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end(error?.stack || String(error));
  }
});

server.listen(port, host, () => {
  const url = `http://${host}:${port}`;
  console.log(`Mario Kart World Cup läuft unter ${url}`);
  if (args.has('--open')) {
    openBrowser(url).catch(() => {});
  }
});
