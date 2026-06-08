const { Client } = require('pg');

const client = new Client({ connectionString: 'postgresql://postgres:12345@localhost:5432/proyectobd' });

async function run() {
  await client.connect();
  try {
    const catsRes = await client.query('SELECT id_categoria, nombre FROM categoria');
    const categorias = catsRes.rows;
    
    // Distribute differently so the chart looks dynamic
    const distrib = {
      'Laptops': 15,
      'Monitores': 8,
      'Accesorios': 25,
      'Proyectores': 3,
      'Redes': 0 // User said not Redes
    };

    let idUbicacion = 1;
    let count = 100; // start unique codes

    for (const cat of categorias) {
      const cantidad = distrib[cat.nombre] || 0;
      for (let i = 0; i < cantidad; i++) {
        count++;
        await client.query(`
          INSERT INTO articulo (codigo_institucional, nombre, descripcion, valor, id_categoria, id_estado_articulo, id_ubicacion)
          VALUES ($1, $2, $3, $4, $5, $6, $7)
        `, [
          `F-NEW-${count}`,
          `${cat.nombre} de prueba ${count}`,
          `Artículo autogenerado para ${cat.nombre}`,
          Math.floor(Math.random() * 500) + 10,
          cat.id_categoria,
          1, // Disponible
          idUbicacion
        ]);
      }
    }
    console.log('Nuevos artículos insertados con éxito!');
  } catch (err) {
    console.error('Error:', err);
  } finally {
    client.end();
  }
}

run();
