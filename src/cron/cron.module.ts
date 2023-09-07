import { forwardRef, Module } from '@nestjs/common';
import { CronService } from './cron.service';
import { ScheduleModule } from '@nestjs/schedule';
import { StudentModule } from '../student/student.module';

@Module({
  imports: [ScheduleModule.forRoot(), forwardRef(() => StudentModule)],
  providers: [CronService],
})
export class CronModule {}
