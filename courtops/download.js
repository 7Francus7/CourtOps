const https = require('https');
const fs = require('fs');

const url = 'https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ7Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpaCiVodG1sX2Y3NmU2ZDQ3ZTI5OTQwNWFiYWI0NTJhYjljNGIwN2RlEgsSBxDP_-L-xQcYAZIBIwoKcHJvamVjdF9pZBIVQhMxMTUzODkzNjQ4Mzg1OTg1MDM3&filename=&opi=96797242';

https.get(url, (res) => {
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    fs.writeFileSync('manifesto.html', data);
    console.log('Downloaded');
  });
});
