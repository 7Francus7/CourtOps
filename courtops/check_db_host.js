const fs = require('fs');
try {
       const env = fs.readFileSync('.env', 'utf8');
       const match = env.match(/DATABASE_URL=(.+)/);
       if (match && match[1]) {
              const url = match[1].trim();
              if (url.includes("localhost") || url.includes("127.0.0.1") || url.includes("@db:5432")) {
                     console.log("LOCAL_DB");
              } else {
                     console.log("CLOUD_DB");
              }
       } else {
              console.log("NO_URL");
       }
} catch (e) {
       console.log("ERROR: " + e.message);
}
