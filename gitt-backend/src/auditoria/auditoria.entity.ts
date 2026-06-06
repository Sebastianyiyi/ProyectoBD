import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('auditoria')
export class Auditoria {
  @PrimaryGeneratedColumn()
  id_auditoria!: number;

  @Column({ type: 'varchar', length: 100 })
  tabla_afectada!: string;

  @Column({ type: 'varchar', length: 20 })
  accion!: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  fecha_hora!: Date;

  @Column({ type: 'varchar', length: 50, nullable: true })
  ip_origen!: string | null;

  @Column({ type: 'text', nullable: true })
  detalle!: string | null;

  @Column({ type: 'text', nullable: true })
  datos_antes!: string | null;

  @Column({ type: 'text', nullable: true })
  datos_despues!: string | null;

  @Column({ type: 'int', nullable: true })
  id_usuario!: number | null;
}
