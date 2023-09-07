import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { databaseConfig } from 'ormConfig';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { RateLimiterConfiguration } from 'config';
import { AuthModule } from './auth/auth.module';
import { HrModule } from './hr/hr.module';
import { StudentModule } from './student/student.module';
import { CronModule } from './cron/cron.module';

@Module({
  imports: [
    TypeOrmModule.forRoot(databaseConfig as TypeOrmModule),
    ThrottlerModule.forRoot(RateLimiterConfiguration),
    AuthModule,
    HrModule,
    StudentModule,
    CronModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
