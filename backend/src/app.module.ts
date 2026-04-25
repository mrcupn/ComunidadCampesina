import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsuariosModule } from './usuarios/usuarios.module';
import { PobladoresModule } from './pobladores/pobladores.module';
import { RolesModule } from './roles/roles.module';
import { EventosModule } from './eventos/eventos.module';
import { AsistenciasModule } from './asistencias/asistencias.module';
import { AuthModule } from './auth/auth.module';
import { ReportesModule } from './reportes/reportes.module';
import { TipoPobladorModule } from './tipo-poblador/tipo-poblador.module';
import { AnimalesModule } from './animales/animales.module';
import { MotivoOperacionModule } from './motivo-operacion/motivo-operacion.module';
import { OperacionesModule } from './operaciones/operaciones.module';
import { AuditoriaModule } from './auditoria/auditoria.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DB_HOST'),
        port: +configService.get('DB_PORT')!,
        username: configService.get('DB_USER'),
        password: configService.get('DB_PASSWORD'),
        database: configService.get('DB_NAME'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: true,
      }),
      inject: [ConfigService],
    }),
    AuthModule,
    UsuariosModule,
    PobladoresModule,
    RolesModule,
    EventosModule,
    AsistenciasModule,
    ReportesModule,
    TipoPobladorModule,
    AnimalesModule,
    MotivoOperacionModule,
    OperacionesModule,
    AuditoriaModule,
  ],
})
export class AppModule {}