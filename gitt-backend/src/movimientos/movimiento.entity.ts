import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('movimiento')
export class Movimiento {
  @PrimaryGeneratedColumn()
  id_movimiento!: number;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  fecha_movimiento!: Date;

  @Column({ type: 'varchar', length: 300, nullable: true })
  motivo!: string | null;

  @Column({ type: 'varchar', length: 500, nullable: true })
  observacion!: string | null;

  @Column({ type: 'int' })
  id_articulo!: number;

  @Column({ type: 'int', nullable: true })
  id_ubicacion_origen!: number | null;

  @Column({ type: 'int' })
  id_ubicacion_destino!: number;

  @Column({ type: 'int' })
  id_usuario!: number;

  @Column({ type: 'int' })
  id_tipo_movimiento!: number;
}
