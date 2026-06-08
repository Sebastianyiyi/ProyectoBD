import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('notificacion')
export class Notificacion {
  @PrimaryGeneratedColumn()
  id_notificacion!: number;

  @Column({ type: 'varchar', length: 200, nullable: true })
  asunto!: string | null;

  @Column({ type: 'text', nullable: true })
  mensaje!: string | null;

  @Column({ type: 'timestamp', nullable: true })
  fecha_programada!: Date | null;

  @Column({ type: 'timestamp', nullable: true })
  fecha_envio!: Date | null;

  @Column({ type: 'int' })
  id_usuario!: number;

  @Column({ type: 'int' })
  id_tipo_notificacion!: number;

  @Column({ type: 'int' })
  id_estado_notificacion!: number;

  @Column({ type: 'int', nullable: true })
  id_prestamo!: number | null;

  @Column({ type: 'int', nullable: true })
  id_mantenimiento!: number | null;
}
