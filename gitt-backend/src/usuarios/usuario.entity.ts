import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('usuario')
export class Usuario {
  @PrimaryGeneratedColumn()
  id_usuario: number;

  @Column({ length: 13 })
  cedula: string;

  @Column({ length: 100 })
  nombres: string;

  @Column({ length: 100 })
  apellidos: string;

  @Column({ length: 120 })
  correo: string;

  @Column({ type: 'varchar', length: 15, nullable: true })
  telefono: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  contrasena_hash: string | null;

  @Column({ type: 'date' })
  fecha_registro: string;

  @Column({ type: 'timestamp', nullable: true })
  ultimo_acceso: Date | null;

  @Column()
  id_rol: number;

  @Column()
  id_estado_usuario: number;
}
