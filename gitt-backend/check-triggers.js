const { Client } = require('pg');
const client = new Client({ connectionString: 'postgresql://postgres:12345@localhost:5432/proyectobd' });
client.connect().then(async () => {
  try {
    const res = await client.query(`
      SELECT tgname, relname, proname 
      FROM pg_trigger t
      JOIN pg_class c ON t.tgrelid = c.oid
      JOIN pg_proc p ON t.tgfoid = p.oid
      WHERE proname = 'registrar_auditoria';
    `);
    console.table(res.rows);
  } finally {
    client.end();
  }
});
