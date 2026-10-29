const https = require('https');

function callMcp(method, params = {}) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({
      jsonrpc: "2.0",
      id: Date.now(),
      method: method,
      params: params
    });

    const options = {
      hostname: 'stitch.googleapis.com',
      port: 443,
      path: '/mcp',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
        'X-Goog-Api-Key': 'AQ.Ab8RN6KsbmZQ3cLDTXm_BeCo1ntlgorr-QXFkGkMFcDccUn3Gg'
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          resolve(data);
        }
      });
    });

    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

async function run() {
  const res = await callMcp("tools/call", {
    name: "list_screens",
    arguments: {
      project_name: "projects/3436897515447961264"
    }
  });
  console.log(JSON.stringify(res, null, 2));
}

run();
