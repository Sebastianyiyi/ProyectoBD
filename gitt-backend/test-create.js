const http = require('http');

const data = JSON.stringify({
  cedula: '1234567890',
  nombres: 'Test',
  apellidos: 'User',
  correo: 'test@test.com',
  id_rol: 1,
  id_estado_usuario: 1,
  contrasena: '1234567890'
});

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/usuarios',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

const req = http.request(options, (res) => {
  let body = '';
  res.on('data', d => body += d);
  res.on('end', () => console.log('Response:', res.statusCode, body));
});

req.on('error', console.error);
req.write(data);
req.end();
