import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('prestamo')
export class Prestamo {
  @PrimaryGeneratedColumn()
  id_prestamo!: number;

  @Column({ type: 'date', default: () => 'CURRENT_DATE' })
  fecha_solicitud!: string;

  @Column({ type: 'date', nullable: true })
  fecha_aprobacion!: string | null;

  @Column({ type: 'date', nullable: true })
  fecha_entrega!: string | null;

  @Column({ type: 'date', nullable: true })
  fecha_prevista_devolucion!: string | null;

  @Column({ type: 'date', nullable: true })
  fecha_devolucion_real!: string | null;

  @Column({ type: 'varchar', length: 500, nullable: true })
  observacion!: string | null;

  @Column({ type: 'int' })
  id_solicitante!: number;

  @Column({ type: 'int', nullable: true })
  id_aprobador!: number | null;

  @Column({ type: 'int' })
  id_estado_prestamo!: number;
}
