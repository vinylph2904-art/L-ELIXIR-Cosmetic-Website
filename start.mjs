import { spawn } from 'child_process';
import net from 'net';

const jsonApiPort = 3001;

function isPortOpen(port) {
  return new Promise((resolve) => {
    const socket = net.createConnection({ host: '127.0.0.1', port });

    socket.once('connect', () => {
      socket.end();
      resolve(true);
    });

    socket.once('error', () => {
      resolve(false);
    });
  });
}

function startCommand(command, args) {
  return spawn(command, args, {
    stdio: 'inherit',
    shell: true
  });
}

async function main() {
  const apiAlreadyRunning = await isPortOpen(jsonApiPort);
  let apiProcess = null;

  if (apiAlreadyRunning) {
    console.log(`JSON API already listening on port ${jsonApiPort}; skipping server start.`);
  } else {
    apiProcess = startCommand('npm', ['run', 'server']);
  }

  const angularProcess = startCommand('npm', ['run', 'ng', '--', 'serve', '--open']);

  const shutdown = () => {
    if (apiProcess && !apiProcess.killed) {
      apiProcess.kill();
    }
    if (angularProcess && !angularProcess.killed) {
      angularProcess.kill();
    }
  };

  process.on('SIGINT', () => {
    shutdown();
    process.exit(0);
  });

  process.on('SIGTERM', () => {
    shutdown();
    process.exit(0);
  });

  angularProcess.on('exit', (code) => {
    shutdown();
    process.exit(code ?? 0);
  });

  if (apiProcess) {
    apiProcess.on('exit', (code) => {
      if ((code ?? 0) !== 0) {
        console.error(`JSON API server exited with code ${code}`);
      }
    });
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});