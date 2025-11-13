//create a dummy admin with these credentials for test use
import http from 'http';

const data = JSON.stringify({
  email: 'admin@gmail.com',
  password: 'admin',
  name: 'admin'
});

const options = {
  hostname: 'localhost',
  port: 4000,
  path: '/api/adminauth/setadmin',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(data)
  }
};

const req = http.request(options, res => {
  let body = '';
  res.on('data', chunk => body += chunk);
  res.on('end', () => 
    console.log(body)
  );
});

req.on('error', err => 
  console.error(err)
);
req.write(data);
req.end();
