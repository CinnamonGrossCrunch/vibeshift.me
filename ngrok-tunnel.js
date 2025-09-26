#!/usr/bin/env node

// Ngrok tunnel for better reliability
(async () => {
  const ngrok = (await import("@ngrok/ngrok")).default;
  const open = (await import("open")).default;

  try {
    // Start ngrok tunnel
    const listener = await ngrok.forward({ addr: 3000, authtoken_from_env: true });
    const dev = listener.url();
    const prod = "https://oski.app";

    console.log(`Dev:  ${dev}`);
    console.log(`Prod: ${prod}`);

    // Open side by side in Chrome
    await open(`chrome --new-window --app="data:text/html,<frameset cols='50%,50%'><frame src='${dev}'><frame src='${prod}'></frameset>"`);

    // Keep alive
    process.on('SIGINT', async () => {
      console.log("❌ Closing tunnel...");
      await ngrok.disconnect();
      process.exit(0);
    });

  } catch (error) {
    console.error("❌ Ngrok error:", error.message);
    console.log("💡 Try: ngrok config add-authtoken YOUR_TOKEN");
    console.log("💡 Or use LocalTunnel fallback...");
    
    // Fallback to localtunnel
    const localtunnel = (await import("localtunnel")).default;
    const tunnel = await localtunnel({ port: 3000 });
    console.log(`🔄 Fallback Dev: ${tunnel.url}`);
    
    await open(`chrome --new-window --app="data:text/html,<frameset cols='50%,50%'><frame src='${tunnel.url}'><frame src='https://oski.app'></frameset>"`);
  }
})();
