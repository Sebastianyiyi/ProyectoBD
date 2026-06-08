const { Client } = require('pg');
const client = new Client({ connectionString: 'postgresql://postgres:12345@localhost:5432/proyectobd' });
client.connect().then(async () => {
  try {
    await client.query("INSERT INTO tipo_movimiento (nombre) VALUES ('Temporal (Evento/Clase)'), ('Permanente (Reasignación)') ON CONFLICT DO NOTHING");
    console.log('Tipos insertados');
  } finally {
    client.end();
  }
});
