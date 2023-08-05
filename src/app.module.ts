import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './modules/users/users.module';
import { DATABASE_CONFIGS } from '@shared/database';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRootAsync(DATABASE_CONFIGS),
    UsersModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
