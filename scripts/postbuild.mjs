import { cpSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { extname, join } from 'node:path';

const outputDirectory = 'dist';

cpSync('static', outputDirectory, { recursive: true });

function normalizeHtmlPaths(directory) {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const filePath = join(directory, entry.name);

    if (entry.isDirectory()) {
      normalizeHtmlPaths(filePath);
      continue;
    }

    if (extname(entry.name) !== '.html') continue;

    const html = readFileSync(filePath, 'utf8');
    const normalized = html.replace(
      /\b(href|src)=(['"])(.*?)\2/g,
      (match, attribute, quote, value) =>
        `${attribute}=${quote}${value.replaceAll('\\', '/')}${quote}`,
    );

    if (normalized !== html) writeFileSync(filePath, normalized);
  }
}

normalizeHtmlPaths(outputDirectory);
