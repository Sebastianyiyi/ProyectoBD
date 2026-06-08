const { Client } = require('pg');
const client = new Client({ connectionString: 'postgresql://postgres:12345@localhost:5432/proyectobd' });

const usuariosData = [
  { cedula: '1111111111', nombres: 'Carlos', apellidos: 'Pérez', correo: 'carlos.perez@test.com', id_rol: 1, id_estado_usuario: 1 },
  { cedula: '2222222222', nombres: 'María', apellidos: 'Gómez', correo: 'maria.gomez@test.com', id_rol: 1, id_estado_usuario: 1 },
  { cedula: '3333333333', nombres: 'Luis', apellidos: 'Rodríguez', correo: 'luis.rodriguez@test.com', id_rol: 1, id_estado_usuario: 1 }
];

const articulosData = Array.from({ length: 20 }).map((_, i) => {
  const tipos = [
    { n: 'Laptop Dell Latitude', c: 1, m: 'Dell', mod: 'Latitude 5420' },
    { n: 'Proyector Epson', c: 2, m: 'Epson', mod: 'PowerLite 119W' },
    { n: 'Router Cisco', c: 3, m: 'Cisco', mod: 'RV160W' },
    { n: 'Monitor Samsung 24', c: 4, m: 'Samsung', mod: 'F24T350FHL' },
    { n: 'Teclado Logitech', c: 5, m: 'Logitech', mod: 'K120' }
  ];
  const t = tipos[i % tipos.length];

  const num = (i + 1).toString().padStart(3, '0');
  const sn = Math.random().toString(36).substring(2, 10).toUpperCase();

  return {
    codigo_institucional: 'UTA-FISEI-' + num,
    nombre: t.n,
    marca: t.m,
    modelo: t.mod,
    numero_serie: 'SN-' + sn,
    id_categoria: t.c,
    id_estado_articulo: 1,
    id_ubicacion: i % 2 === 0 ? 1 : 2
  };
});

client.connect().then(async () => {
  try {
    for (const u of usuariosData) {
      await client.query(
        'INSERT INTO usuario (cedula, nombres, apellidos, correo, id_rol, id_estado_usuario) VALUES ($1, $2, $3, $4, $5, $6)',
        [u.cedula, u.nombres, u.apellidos, u.correo, u.id_rol, u.id_estado_usuario]
      );
    }

    for (const a of articulosData) {
      await client.query(
        'INSERT INTO articulo (codigo_institucional, nombre, marca, modelo, numero_serie, id_categoria, id_estado_articulo, id_ubicacion) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
        [a.codigo_institucional, a.nombre, a.marca, a.modelo, a.numero_serie, a.id_categoria, a.id_estado_articulo, a.id_ubicacion]
      );
    }
    console.log('Seeded successfully!');
  } catch (err) {
    console.error(err);
  } finally {
    client.end();
  }
});
