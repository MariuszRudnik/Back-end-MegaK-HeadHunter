import { Body, Controller, Get, Inject, Param, Post, UseFilters, UseGuards, UsePipes } from '@nestjs/common';
import { AuthGuard } from 'src/guards/Auth.guard';
import { AcceptableExceptionFilter } from 'src/filter/not-acceptable.filter';
import { NewHrUserValidation } from 'src/pipe/hr-validation.pipe';
import { AfterAddData } from 'src/types';
import { HrDto } from './dto/hr-add.dto';
import { HrService } from './hr.service';
import { UserObject } from 'src/decorators/user-object.decorator';
import { UserEntity } from 'src/auth/user.entity';
import { UseRole } from 'src/decorators/user-role.decorator';

@Controller('recruiter')
export class HrController {
    constructor(
        @Inject(HrService) private hrService: HrService
    ) { }


    @Post('/add')
    @UseRole('admin')
    @UseGuards(AuthGuard)
    @UsePipes(NewHrUserValidation)
    @UseFilters(new AcceptableExceptionFilter())
    async addRecruiterAccount(
        @Body() hrData: HrDto
    ): Promise<AfterAddData> {
        try {
            const response = await this.hrService.addHrUser(hrData);
            return response;
        } catch (err) {
            console.log(err);
            return {
                actionStatus: false,
                message: err.message
            }
        }
    }

    @Get('/addstudent/:id')
    @UseRole('recruiter')
    @UseGuards(AuthGuard)
    async addStudentToList(
        @UserObject() user: UserEntity,
        @Param('id') id: string
    ) {
        return await this.hrService.AddStudentToList(user, id);
    }

    @Get('/pushback/:id')
    @UseRole('recruiter')
    @UseGuards(AuthGuard)
    async pushBackStudent(
        @Param('id') id: string,
        @UserObject() user: UserEntity
    ) {
        return await this.hrService.studentPushback(id, user);
    }

    @Get('/hirestudent/:id')
    @UseRole('recruiter')
    @UseGuards(AuthGuard)
    async hireStudent(
        @Param('id') id: string,
        @UserObject() recruiter: UserEntity
    ) {
        return await this.hrService.hireStudent(id, recruiter);
    }

    @Get('/message')
    @UseRole('admin')
    @UseGuards(AuthGuard)
    async getMessages() {
        return await this.hrService.getMessages();
    }

}
