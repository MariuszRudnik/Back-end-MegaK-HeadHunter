import {
  Body,
  Controller,
  Get,
  Inject,
  Param,
  Patch,
  Post,
  UploadedFiles,
  UseFilters,
  UseGuards,
  UseInterceptors,
  UsePipes,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { destionation } from 'src/multer/multer.storage';
import { StudentsSelectedByHrResponse, UploadeFileMulter } from 'src/types';
import { FileTypeValidationPipe } from 'src/pipe/file-validation.pipe';
import { AcceptableExceptionFilter } from 'src/filter/not-acceptable.filter';
import { StudentService } from './student.service';
import { AuthGuard } from 'src/guards/Auth.guard';
import { UseRole } from 'src/decorators/user-role.decorator';
import {
  StudentExtendedData,
  StudentExtendedDataPatch,
} from './dto/extended-data.dto';
import { StudentExtensionDataValidate } from 'src/pipe/student-validation.pipe';
import { UserObject } from 'src/decorators/user-object.decorator';
import { UserEntity } from 'src/auth/user.entity';

@Controller('student')
export class StudentController {
  constructor(@Inject(StudentService) private studentService: StudentService) {}

  @Get('/hired')
  @UseRole('student')
  @UseGuards(AuthGuard)
  async studentHired(@UserObject() user: UserEntity) {
    return await this.studentService.studentHiringAndBlocking(user);
  }

  @Get('/selected')
  @UseRole('recruiter')
  @UseGuards(AuthGuard)
  async studentsSelectedByHr(
    @UserObject() user: UserEntity,
  ): Promise<StudentsSelectedByHrResponse> {
    return await this.studentService.studentsSelectedByHr(user);
  }

  @Post('/add')
  @UseRole('admin')
  @UseGuards(AuthGuard)
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        {
          name: 'file',
          maxCount: 1,
        },
      ],
      {
        dest: destionation(),
      },
    ),
  )
  @UseFilters(new AcceptableExceptionFilter())
  async uploadAndAddStudents(
    @UploadedFiles(new FileTypeValidationPipe()) incomeFile: UploadeFileMulter,
  ) {
    try {
      const result = await this.studentService.addStudentFromList(incomeFile);
      return {
        actionStatus: true,
        message: `Import zakończony, pobrano ${result.iterations} użytkowników, do bazy dodano: ${result.added}, niepowodzenia: ${result.fold}`,
      };
    } catch (err) {
      console.log(err);
      return {
        actionStatus: false,
        message: `Błąd w trakcie importu kursantów`,
      };
    }
  }

  @Get('/freelist')
  @UseRole('recruiter')
  @UseGuards(AuthGuard)
  async getFreeStudents() {
    try {
      const result = await this.studentService.getFreeStudnetList();
      return {
        actionStatus: true,
        data: result,
      };
    } catch (err) {
      console.log(err);
      return {
        actionStatus: false,
        data: null,
      };
    }
  }
  @Get('/data')
  @UseRole('student')
  @UseGuards(AuthGuard)
  async getStudentData(
    @UserObject() user: UserEntity
  ) {
    return await this.studentService.getLogedStudentData(user)
  }


  @Get('getone/:id')
  @UseRole('recruiter')
  @UseGuards(AuthGuard)
  async getStudnetforCV(@Param('id') id: string) {
    try {
      const result = await this.studentService.getOneStudent(id);
      if (!result) {
        return {
          actionStatus: false,
          message: 'Student o podanym id nie figuruje w bazie',
        };
      } else {
        return {
          actionStatus: true,
          message: result,
        };
      }
    } catch (err) {
      console.log(err);
      return {
        actionStatus: false,
        message: 'Błąd serwera',
      };
    }
  }

  @Patch('/update')
  @UseRole('student')
  @UseGuards(AuthGuard)
  @UseFilters(new AcceptableExceptionFilter())
  async studentDataUpdate(
    @UserObject() user: UserEntity,
    @Body(StudentExtensionDataValidate) data: StudentExtendedDataPatch,
  ) {
    return this.studentService.patchStudentData(user, data);
  }

  @Post('/register')
  @UsePipes(StudentExtensionDataValidate)
  @UseFilters(new AcceptableExceptionFilter())
  async addStudentRegistrationData(@Body() data: StudentExtendedData) {
    return await this.studentService.addStudentdata(data);
  }
}
