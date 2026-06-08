const { Client } = require('pg');
const client = new Client({ connectionString: 'postgresql://postgres:12345@localhost:5432/proyectobd' });

const sql = `
-- 1. Crear la función del trigger genérico
CREATE OR REPLACE FUNCTION log_auditoria()
RETURNS TRIGGER AS $$
DECLARE
    v_id_usuario INTEGER;
    v_ip_origen VARCHAR;
    v_datos_antes TEXT;
    v_datos_despues TEXT;
    v_detalle TEXT;
BEGIN
    -- Intentar obtener el usuario de la sesión actual
    BEGIN
        v_id_usuario := current_setting('app.current_user_id')::INTEGER;
    EXCEPTION WHEN OTHERS THEN
        v_id_usuario := NULL;
    END;

    BEGIN
        v_ip_origen := current_setting('app.current_ip');
    EXCEPTION WHEN OTHERS THEN
        v_ip_origen := '127.0.0.1';
    END;

    IF (TG_OP = 'DELETE') THEN
        v_datos_antes := row_to_json(OLD)::text;
        v_datos_despues := NULL;
        v_detalle := 'Registro eliminado en ' || TG_TABLE_NAME;
    ELSIF (TG_OP = 'UPDATE') THEN
        v_datos_antes := row_to_json(OLD)::text;
        v_datos_despues := row_to_json(NEW)::text;
        v_detalle := 'Registro actualizado en ' || TG_TABLE_NAME;
    ELSIF (TG_OP = 'INSERT') THEN
        v_datos_antes := NULL;
        v_datos_despues := row_to_json(NEW)::text;
        v_detalle := 'Registro creado en ' || TG_TABLE_NAME;
    END IF;

    INSERT INTO auditoria (
        tabla_afectada, 
        accion, 
        fecha_hora, 
        ip_origen, 
        detalle, 
        datos_antes, 
        datos_despues, 
        id_usuario
    ) VALUES (
        TG_TABLE_NAME, 
        TG_OP, 
        CURRENT_TIMESTAMP, 
        v_ip_origen, 
        v_detalle, 
        v_datos_antes, 
        v_datos_despues, 
        v_id_usuario
    );

    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- 2. Crear los triggers en cada tabla (eliminar primero por si existen)

-- ARTICULO
DROP TRIGGER IF EXISTS trg_auditoria_articulo ON articulo;
CREATE TRIGGER trg_auditoria_articulo
AFTER INSERT OR UPDATE OR DELETE ON articulo
FOR EACH ROW EXECUTE FUNCTION log_auditoria();

-- PRESTAMO
DROP TRIGGER IF EXISTS trg_auditoria_prestamo ON prestamo;
CREATE TRIGGER trg_auditoria_prestamo
AFTER INSERT OR UPDATE OR DELETE ON prestamo
FOR EACH ROW EXECUTE FUNCTION log_auditoria();

-- MANTENIMIENTO
DROP TRIGGER IF EXISTS trg_auditoria_mantenimiento ON mantenimiento;
CREATE TRIGGER trg_auditoria_mantenimiento
AFTER INSERT OR UPDATE OR DELETE ON mantenimiento
FOR EACH ROW EXECUTE FUNCTION log_auditoria();

-- MOVIMIENTO
DROP TRIGGER IF EXISTS trg_auditoria_movimiento ON movimiento;
CREATE TRIGGER trg_auditoria_movimiento
AFTER INSERT OR UPDATE OR DELETE ON movimiento
FOR EACH ROW EXECUTE FUNCTION log_auditoria();

-- UBICACION
DROP TRIGGER IF EXISTS trg_auditoria_ubicacion ON ubicacion;
CREATE TRIGGER trg_auditoria_ubicacion
AFTER INSERT OR UPDATE OR DELETE ON ubicacion
FOR EACH ROW EXECUTE FUNCTION log_auditoria();

-- USUARIO
DROP TRIGGER IF EXISTS trg_auditoria_usuario ON usuario;
CREATE TRIGGER trg_auditoria_usuario
AFTER INSERT OR UPDATE OR DELETE ON usuario
FOR EACH ROW EXECUTE FUNCTION log_auditoria();
`;

client.connect().then(async () => {
  try {
    await client.query(sql);
    console.log('Triggers de Auditoría creados exitosamente.');
  } catch (err) {
    console.error('Error:', err);
  } finally {
    client.end();
  }
});
