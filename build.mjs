import * as esbuild from 'esbuild';
import { promises as fs } from 'fs'; // Use promises API for better async handling
import path from 'path';

await esbuild
  .build({
    entryPoints: ['./src/index.ts'],
    bundle: true,
    minify: true,
    outdir: 'dist',
  })
  .then(async () => {
    try {
      await fs.copyFile('./.env', './dist/.env');
    } catch {
      console.log('No .env file found in build, skipping...');
    }
    await fs.copyFile('./index.html', './dist/index.html');
    await fs.copyFile('./index.css', './dist/index.css');
    await fs.cp('./assets', './dist/assets', { recursive: true });

    const report = await reportFileSizes('./dist');
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

  getReadableFileSize(totalBytes);
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