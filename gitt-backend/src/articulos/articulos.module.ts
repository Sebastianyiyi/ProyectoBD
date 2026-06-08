import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ArticulosController } from './articulos.controller';
import { ArticulosService } from './articulos.service';
import { Articulo } from './articulo.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Articulo])],
  controllers: [ArticulosController],
  providers: [ArticulosService],
  exports: [TypeOrmModule, ArticulosService],
})
export class ArticulosModule {}
