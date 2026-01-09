const fs = require('fs');
try {
       const env = fs.readFileSync('.env', 'utf8');
       const lines = env.split('\n');
       lines.forEach(line => {
              const parts = line.split('=');
              if (parts.length > 0 && parts[0].trim()) {
                     console.log("Key found: " + parts[0].trim());
              }
       });
} catch (e) {
       console.error("Error reading .env: " + e.message);
}
