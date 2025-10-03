// src/app.module.ts ( 定義應用的根模組，導入其他模組 （DB 連線模組）)

import { Module } from '@nestjs/common';
import { TypeormRootModule } from './database/typeorm/typeorm.module'; // DB 連線模組
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';
import { LeavesModule } from './modules/leaves/leaves.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { NiggaController }  from './nigga.controller'
import { NiggaService } from './nigga.service';


@Module({
  imports: [
    TypeormRootModule,
    UsersModule,
    LeavesModule,
    AuthModule
  ],
  controllers: [AppController, NiggaController],
  providers: [AppService, NiggaService],
})

export class AppModule {}
