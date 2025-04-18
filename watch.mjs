import * as esbuild from 'esbuild';
import { promises as fs } from 'fs'; // Use promises API for better async handling

async function watch() {
  let ctx = await esbuild.context({
    entryPoints: ["./src/index.ts", "./index.css"],
    minify: false,
    sourcemap: true,
    outdir: "live",
    bundle: true,
    logLevel: "info",
    entryNames: '[name]',
    loader: { ".css": "css" },
  })

  // Handle process termination signals for cleanup
  const cleanup = async () => {
    console.log("Build process stopped. Cleaning up...");
    await ctx.dispose();
    await fs.rm("./live", {recursive: true, force: true}); // Remove the live directory
    process.exit(0);
  };

  process.on("SIGINT", cleanup); // Handle Ctrl+C
  process.on("SIGTERM", cleanup); // Handle termination signals

  await ctx.watch().then(async () => {
    await fs.mkdir('./live', { recursive: true });
    try {
      await fs.copyFile('./.env', './live/.env');
    } catch {
      console.log('No .env file found in build, skipping...');
    }
    await fs.copyFile('./index.html', './live/index.html');
    await fs.cp('./assets', './live/assets', { recursive: true });
    console.log('project built');
  });
}
watch();