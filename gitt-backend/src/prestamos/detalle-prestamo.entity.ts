import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('detalle_prestamo')
export class DetallePrestamo {
  @PrimaryColumn({ type: 'int' })
  id_prestamo!: number;

  @PrimaryColumn({ type: 'int' })
  id_articulo!: number;

  @Column({ type: 'varchar', length: 100, nullable: true })
  estado_salida!: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  estado_entrada!: string | null;

  @Column({ type: 'varchar', length: 500, nullable: true })
  observacion!: string | null;
}
