import { fileURLToPath } from "url";
import path from "path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Pin workspace root to this project directory, avoiding false-positive
  // lockfile detection when other packages exist in parent directories.
  outputFileTracingRoot: __dirname,
};

export default nextConfig;
