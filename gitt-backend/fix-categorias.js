// script-categorias.js
const { Client } = require('pg');

const client = new Client({
  user: 'postgres',
  host: 'localhost',
  database: 'proyectobd',
  password: '12345',
  port: 5432,
});

async function run() {
  await client.connect();

  // Insertar categorías
  await client.query(`
    INSERT INTO categoria (id_categoria, nombre) VALUES 
    (3, 'Desktops'),
    (4, 'Impresoras'),
    (5, 'Monitores'),
    (6, 'Accesorios'),
    (7, 'Redes')
    ON CONFLICT (id_categoria) DO NOTHING;
  `);

  // Actualizar artículos a sus categorías correctas basado en el nombre
  await client.query(`UPDATE articulo SET id_categoria = 3 WHERE nombre ILIKE '%desktop%' OR nombre ILIKE '%pc%';`);
  await client.query(`UPDATE articulo SET id_categoria = 4 WHERE nombre ILIKE '%impresora%';`);
  await client.query(`UPDATE articulo SET id_categoria = 5 WHERE nombre ILIKE '%monitor%';`);
  await client.query(`UPDATE articulo SET id_categoria = 7 WHERE nombre ILIKE '%switch%' OR nombre ILIKE '%router%';`);

  // Ajustar la secuencia de categoria por si acaso
  await client.query(`SELECT setval('categoria_id_categoria_seq', (SELECT MAX(id_categoria) FROM categoria));`);

  console.log('Categorías y artículos actualizados');
  await client.end();
}

run().catch(console.error);
