import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('mantenimiento')
export class Mantenimiento {
  @PrimaryGeneratedColumn()
  id_mantenimiento!: number;

  @Column({ type: 'date' })
  fecha_inicio!: string;

  @Column({ type: 'date', nullable: true })
  fecha_fin!: string | null;

  @Column({ type: 'text', nullable: true })
  descripcion!: string | null;

  @Column({ type: 'varchar', length: 200, nullable: true })
  tecnico_proveedor!: string | null;

  @Column({ type: 'numeric', precision: 10, scale: 2, nullable: true })
  costo!: number | null;

  @Column({ type: 'date', nullable: true })
  proximo_mantenimiento!: string | null;

  @Column({ type: 'int' })
  id_articulo!: number;

  @Column({ type: 'int' })
  id_tipo_mantenimiento!: number;

  @Column({ type: 'int' })
  id_estado_mantenimiento!: number;
}
