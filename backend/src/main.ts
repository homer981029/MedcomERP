// src/main.ts ( 應用入口文件定義註冊 ROUTER 全局前綴 驗證管道等 )

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true });
// api 前綴
  app.setGlobalPrefix('api');



// 全域 ValidationPipe 設定
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,// 啟用白名單   把 DTO 沒有宣告的欄位剃掉
    forbidNonWhitelisted: true, // 多給欄位直接 400
    transform: true, // 依 DTO 型別自動轉型（配 class-transformer） 啟用轉型（字串→數字/日期）
  }));

  await app.listen(process.env.NEST_PORT || 4000);
}
bootstrap();
