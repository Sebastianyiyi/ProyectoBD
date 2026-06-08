const { Client } = require('pg');
const client = new Client({ connectionString: 'postgresql://postgres:12345@localhost:5432/proyectobd' });
client.connect().then(async () => {
  try {
    await client.query(`
      INSERT INTO ubicacion (nombre, tipo_ubicacion, bloque, piso, descripcion, id_departamento)
      VALUES 
      ('Laboratorio de Ciberseguridad', 'Laboratorio', 'Bloque C', 'Piso 1', 'Equipado con servidores locales y firewalls físicos para prácticas de hacking ético y redes seguras.', 1),
      ('Laboratorio de Inteligencia Artificial', 'Laboratorio', 'Bloque C', 'Piso 2', 'Estaciones de trabajo de alto rendimiento con GPUs para entrenamiento de modelos.', 1),
      ('Laboratorio de Desarrollo Web y Móvil', 'Laboratorio', 'Bloque B', 'Piso 3', 'Equipos Mac y PC con simuladores de iOS y Android preinstalados.', 1)
    `);
    console.log('Laboratorios insertados correctamente');
  } catch (error) {
    console.error('Error insertando labs:', error);
  } finally {
    client.end();
  }
});
