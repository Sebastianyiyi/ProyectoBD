import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('articulo')
export class Articulo {
  @PrimaryGeneratedColumn()
  id_articulo!: number;

  @Column({ type: 'varchar', length: 60 })
  codigo_institucional!: string;

  @Column({ type: 'varchar', length: 60, nullable: true })
  codigo_barras!: string | null;

  @Column({ type: 'varchar', length: 150 })
  nombre!: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  descripcion!: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  marca!: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  modelo!: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  numero_serie!: string | null;

  @Column({ type: 'date', nullable: true })
  fecha_adquisicion!: string | null;

  @Column({ type: 'numeric', nullable: true })
  valor!: number | null;

  @Column({ type: 'int' })
  id_categoria!: number;

  @Column({ type: 'int' })
  id_estado_articulo!: number;

  @Column({ type: 'int' })
  id_ubicacion!: number;

  @Column({ type: 'int', nullable: true })
  id_responsable!: number | null;
}
