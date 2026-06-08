import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('ubicacion')
export class Ubicacion {
  @PrimaryGeneratedColumn()
  id_ubicacion!: number;

  @Column({ type: 'varchar', length: 100 })
  nombre!: string;

  @Column({ type: 'varchar', length: 60, nullable: true })
  tipo_ubicacion!: string | null;

  @Column({ type: 'varchar', length: 20, nullable: true })
  bloque!: string | null;

  @Column({ type: 'varchar', length: 20, nullable: true })
  piso!: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  descripcion!: string | null;

  @Column({ type: 'int' })
  id_departamento!: number;
}
