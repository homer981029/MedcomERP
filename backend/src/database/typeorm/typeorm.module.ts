// src/database/typeorm/typeorm.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }), // 讀 .env，一次全域可用
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (cfg: ConfigService) => ({
        type: 'postgres',
        host: cfg.get<string>('PG_HOST', 'medcom_erp_db'), //在 Docker Compose 網路裡，用服務/容器名稱
        port: cfg.get<number>('PG_PORT', 5432),
        username: cfg.get<string>('POSTGRES_USER', 'medcom'),
        password: cfg.get<string>('POSTGRES_PASSWORD', 'medcom123'),
        database: cfg.get<string>('POSTGRES_DB', 'medcom_erp'),
        autoLoadEntities: true,
        synchronize: false,
        logging: false,
      }),
    }),
  ],
  exports: [TypeOrmModule],
})
export class TypeormRootModule {}
