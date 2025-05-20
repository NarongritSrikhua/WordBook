const http = require('http');
const { exec } = require('child_process');

// Check if backend is running
function checkBackend() {
  return new Promise((resolve) => {
    const req = http.request({
      host: 'localhost',
      port: 3001,
      path: '/health',
      method: 'GET',
      timeout: 2000
    }, (res) => {
      resolve(res.statusCode === 200);
    });
    
    req.on('error', () => {
      resolve(false);
    });
    
    req.on('timeout', () => {
      req.destroy();
      resolve(false);
    });
    
    req.end();
  });
}

// Start backend if not running
async function main() {
  console.log('Checking if backend is running...');
  const isRunning = await checkBackend();
  
  if (isRunning) {
    console.log('Backend is running!');
  } else {
    console.log('Backend is not running. Starting backend...');
    
    // Start backend in a new process
    const backend = exec('cd ../backend && npm run start:dev', (error) => {
      if (error) {
        console.error('Failed to start backend:', error);
      }
    });
    
    backend.stdout.on('data', (data) => {
      console.log(`Backend: ${data}`);
    });
    
    backend.stderr.on('data', (data) => {
      console.error(`Backend error: ${data}`);
    });
    
    // Wait for backend to start
    let attempts = 0;
    while (attempts < 10) {
      await new Promise(resolve => setTimeout(resolve, 2000));
      const isNowRunning = await checkBackend();
      if (isNowRunning) {
        console.log('Backend started successfully!');
        break;
      }
      attempts++;
      console.log(`Waiting for backend to start (attempt ${attempts}/10)...`);
    }
  }
}

main().catch(console.error);