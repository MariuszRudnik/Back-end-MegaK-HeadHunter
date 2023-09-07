import {forwardRef, Module } from '@nestjs/common';
import { StudentModule } from 'src/student/student.module';
import { HrController } from './hr.controller';
import { HrService } from './hr.service';

@Module({
  imports: [
      forwardRef(() => StudentModule),
  ],
  controllers: [HrController],
  providers: [HrService]
})
export class HrModule { }
