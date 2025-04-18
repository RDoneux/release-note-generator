import * as esbuild from 'esbuild';
import { promises as fs } from 'fs'; // Use promises API for better async handling
import path from 'path';

// Define the output directory
const outdir = './dist';

// Remove the output directory before building
await fs.rm(outdir, { recursive: true, force: true }).catch((err) => {
  if (err.code !== 'ENOENT') {
    console.error('Error removing output directory:', err);
    process.exit(1);
  }
});

await esbuild
  .build({
    entryPoints: ['./src/index.ts', './index.css'],
    bundle: true,
    minify: true,
    splitting: true,
    format: 'esm',
    outdir,
    entryNames: '[name]',
    chunkNames: 'chunks/[name]-[hash]', // Chunk file names
    loader: { '.css': 'css' },
  })
  .then(async () => {
    try {
      await fs.copyFile('./.env', `${outdir}/.env`);
    } catch {
      console.log('No .env file found in build, skipping...');
    }
    await fs.copyFile('./index.html', `${outdir}/index.html`);
    await fs.cp('./assets', `${outdir}/assets`, { recursive: true });

    const report = await reportFileSizes(outdir);
    console.log('File Size Report:\n' + report.lines.join('\n')); // Log the lines array as a string
    console.log('Total Size: ' + getReadableFileSize(report.totalBytes)); // Log the total size
    console.log('project built');
    process.exit(0);
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

async function reportFileSizes(directory) {
  const files = await fs.readdir(directory, { withFileTypes: true });
  const reportLines = [];
  let totalBytes = 0;

  for (const file of files) {
    const filePath = path.join(directory, file.name);
    if (file.isFile()) {
      const stats = await fs.stat(filePath);
      const size = stats.size;
      totalBytes += size; // Add the file size to the total
      const readableSize = getReadableFileSize(size);
      reportLines.push(`${filePath}: ${readableSize}`);
    } else if (file.isDirectory()) {
      // Recursively process subdirectories
      const subdirectoryReport = await reportFileSizes(filePath);
      reportLines.push(...subdirectoryReport.lines);
      totalBytes += subdirectoryReport.totalBytes;
    }
  }

  return { lines: reportLines, totalBytes }; // Return both the lines and total bytes
}

function getReadableFileSize(bytes) {
  const units = ['Bytes', 'KB', 'MB', 'GB'];
  let size = bytes;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }

  return `${size.toFixed(2)} ${units[unitIndex]}`;
}