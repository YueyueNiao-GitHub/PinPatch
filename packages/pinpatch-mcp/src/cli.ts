#!/usr/bin/env node
import { startDaemon } from "./daemon.js";
import { runDoctor } from "./doctor.js";
import { printInstallGuide, runUniversalInstaller } from "./install.js";
import { startMcpServer } from "./mcp.js";
import { ensureDaemonRunning, stopDaemon } from "./runtime.js";
import {
  getTokenPath,
  readUserConfig,
  writeUserConfig,
} from "./config.js";

function help(): void {
  console.log(`pinpatch-mcp - local annotation bridge for MCP agents

Usage:
  pinpatch-mcp daemon                       Start the local HTTP daemon
  pinpatch-mcp mcp                          Start the MCP stdio adapter
  pinpatch-mcp pair                         Create a browser pairing code
  pinpatch-mcp configure-extension <id>     Restrict access to a Chrome extension
  pinpatch-mcp install [--apply]            Show or apply agent configuration
  pinpatch-mcp doctor                       Check the local installation
  pinpatch-mcp stop                         Stop the detached daemon
  pinpatch-mcp token                        Print the token file path
`);
}

async function main(): Promise<void> {
  const [command = "help", ...args] = process.argv.slice(2);
  switch (command) {
    case "daemon": {
      const daemon = await startDaemon();
      console.error(`[PinPatch] daemon listening on ${daemon.baseUrl}`);
      const close = async () => {
        await daemon.close();
        process.exit(0);
      };
      process.once("SIGINT", close);
      process.once("SIGTERM", close);
      return;
    }
    case "mcp": {
      const client = await ensureDaemonRunning();
      await startMcpServer(client);
      return;
    }
    case "pair": {
      const client = await ensureDaemonRunning();
      const pairing = await client.createPairingCode();
      console.log(`Pairing code: ${pairing.code}`);
      console.log(`Expires in ${pairing.expiresInSeconds} seconds.`);
      return;
    }
    case "configure-extension": {
      const extensionId = args[0]?.trim();
      if (!extensionId || !/^[a-p]{32}$/.test(extensionId)) {
        throw new Error("A valid 32-character Chrome extension ID is required");
      }
      const config = readUserConfig();
      const extensionIds = Array.from(
        new Set([...(config.extensionIds || []), extensionId]),
      );
      writeUserConfig({ ...config, extensionIds });
      console.log(`Allowed Chrome extension: ${extensionId}`);
      return;
    }
    case "install":
      if (args.includes("--apply")) {
        process.exitCode = runUniversalInstaller();
      } else {
        printInstallGuide();
      }
      return;
    case "doctor":
      process.exitCode = (await runDoctor()) ? 0 : 1;
      return;
    case "stop":
      console.log(stopDaemon() ? "Daemon stopped." : "Daemon is not running.");
      return;
    case "token": {
      console.log(getTokenPath());
      console.log("Use `pinpatch-mcp pair` to authorize the Chrome extension.");
      return;
    }
    case "help":
    case "--help":
    case "-h":
      help();
      return;
    default:
      help();
      throw new Error(`Unknown command: ${command}`);
  }
}

main().catch((error) => {
  console.error(`[PinPatch] ${(error as Error).message}`);
  process.exitCode = 1;
});
