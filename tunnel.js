#!/usr/bin/env node

// Use dynamic imports for ES modules and built-ins
(async () => {
  const localtunnel = (await import("localtunnel")).default;
  const open = (await import("open")).default;
  const { execSync } = (await import("child_process"));

  // Get public IP for LocalTunnel password (PowerShell compatible)
  const ip = execSync("powershell -Command \"(Invoke-WebRequest -Uri 'https://ifconfig.me/ip' -UseBasicParsing).Content.Trim()\"").toString().trim();
  const tunnel = await localtunnel({ port: 3000, subdomain: "oskidev" });
  const dev = tunnel.url;
  const prod = "https://oski.app";

  console.log(`Dev:  ${dev}`);
  console.log(`Prod: ${prod}`);
  console.log(`Password (auto): ${ip}`);

  // Open side by side in Chrome (adjust for your OS/browser)
  await open(`chrome --new-window --app="data:text/html,<frameset cols='50%,50%'><frame src='${dev}'><frame src='${prod}'></frameset>"`);

  tunnel.on("close", () => {
    console.log("❌ Tunnel closed");
  });
})();
