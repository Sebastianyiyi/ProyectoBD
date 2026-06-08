import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PrestamosController } from './prestamos.controller';
import { PrestamosService } from './prestamos.service';
import { Prestamo } from './prestamo.entity';
import { DetallePrestamo } from './detalle-prestamo.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Prestamo, DetallePrestamo])],
  controllers: [PrestamosController],
  providers: [PrestamosService],
})
export class PrestamosModule {}
