#!/usr/bin/env node
import { spawn } from 'node:child_process';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';
import fs from 'node:fs/promises';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '..');
const viteBin = path.join(projectRoot, 'node_modules', 'vite', 'bin', 'vite.js');
const args = process.argv.slice(2);

const child = spawn(process.execPath, [viteBin, ...args], {
  cwd: projectRoot,
  stdio: 'inherit',
  env: process.env,
});

child.on('exit', async (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }
  if ((code ?? 0) === 0 && args[0] === 'build') {
    const distDir = path.join(projectRoot, 'dist');
    const builtHtml = path.join(distDir, 'index.app.html');
    const finalHtml = path.join(distDir, 'index.html');
    try {
      await fs.access(builtHtml);
      await fs.copyFile(builtHtml, finalHtml);
      await fs.unlink(builtHtml);
    } catch {
      // ignore
    }
  }
  process.exit(code ?? 0);
});
