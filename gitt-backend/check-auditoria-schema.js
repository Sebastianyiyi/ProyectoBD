const { Client } = require('pg');
const client = new Client({ connectionString: 'postgresql://postgres:12345@localhost:5432/proyectobd' });
client.connect().then(async () => {
  try {
    const res = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'auditoria';
    `);
    console.table(res.rows);
  } finally {
    client.end();
  }
});
