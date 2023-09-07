import * as path from 'path';
import { readFile, unlink } from 'fs/promises';
import { Injectable } from '@nestjs/common';
import {
  Role,
  StudentCVResponse,
  StudentListResponse,
  UploadeFileMulter,
  UserImport,
  UserResponse,
  UserStatus,
} from 'src/types';
import { destionation } from 'src/multer/multer.storage';
import { studentDataValidator } from 'src/utils/student-validation';
import { StudentEntity } from './student.entity';
import { UserEntity } from 'src/auth/user.entity';
import { randomSigns } from 'src/utils/random-signs';
import { safetyConfiguration } from 'config';
import { sendActivationLink } from 'src/utils/email-handler';
import { availabeForPatchStudentData, listForHrFilter, studentFilter, studentListFilter } from 'src/utils/student-filter';
import {
  StudentExtendedData,
  StudentExtendedDataPatch,
} from './dto/extended-data.dto';
import { FindOptionsWhere, LessThan, Not } from 'typeorm';
import { comparer } from 'src/auth/crypto';
import { HrEntity } from 'src/hr/hr.entity';

interface Progress {
  added: number;
  fold: number;
  iterations: number;
}

@Injectable()
export class StudentService {

  async removeReservation(): Promise<boolean> {
    try {
      const result = await StudentEntity.find({
        select: ['id'],
        where: {
          reservationEnd: LessThan(new Date()),
          reservationStatus: UserStatus.DURING,
        },
      });

      if (!result) {
        return true;
      }

      const changeDate: {
        reservationEnd: null;
        reservationStatus: UserStatus;
      } = {
        reservationStatus: UserStatus.AVAILABLE,
        reservationEnd: null,
      };

      for (const value of result) {
        await StudentEntity.update(
          {
            id: value.id,
          },
          changeDate,
        );
      }
      return true;
    } catch (err) {
      console.log(err)
      return false;
    }
  }

  async addStudentFromList(file: UploadeFileMulter): Promise<Progress> {
    const data = (await readFile(
      path.join(destionation(), file.file[0].filename),
    )) as unknown as string;
    const uncoded = (await JSON.parse(data)) as UserImport[];

    const addedStudents = await Promise.all(
      uncoded.map(async (student) => {
        const validation = await studentDataValidator(student);

        if (!validation) {
          return false;
        }

        try {
          const newUser = new UserEntity();

          newUser.email = student.email;
          newUser.role = Role.student;
          newUser.link = randomSigns(safetyConfiguration.linkLength);

          await newUser.save();

          const newStudent = new StudentEntity();

          newStudent.projectDegree = student.projectDegree;
          newStudent.teamProjectDegree = student.teamProjectDegree;
          newStudent.courseEngagment = student.courseEngagment;
          newStudent.courseCompletion = student.courseCompletion;
          newStudent.bonusProjectUrls = JSON.stringify(
            student.bonusProjectUrls,
          );
          newStudent.user = newUser;

          await newStudent.save();

          await sendActivationLink(newUser.link, newUser.email, 'student');

          return true;
        } catch (err) {
          console.log(err);
          return false;
        }
      }),
    );

    await unlink(path.join(destionation(), file.file[0].filename));

    const result = {
      iterations: 0,
      added: 0,
      fold: 0,
    };

    await Promise.all(
      addedStudents.map((status) => {
        result.iterations++;
        if (status) {
          result.added++;
        } else {
          result.fold++;
        }
      }),
    );

    return result;
  }

  async getFreeStudnetList(): Promise<StudentListResponse[]> {
    const result = await StudentEntity.find({
      where: {
        reservationStatus: UserStatus.AVAILABLE,
        areDataPatched: true,
      },
      relations: {
        user: true,
      },
    });

    const activeStudent = result.filter(
      (student) => student.user.isActive === true,
    );
    const toSend = activeStudent.map((student) => studentListFilter(student));

    return toSend;
  }

  async getOneStudent(id: string): Promise<StudentCVResponse | null> {
    const result = await StudentEntity.findOne({
      where: {
        id,
        areDataPatched: true,
      },
      relations: {
        user: true,
      },
    });

    if (!result) return null;

    const data = studentFilter(result);
    return data;
  }

  async studentHiringAndBlocking(user: UserEntity): Promise<UserResponse> {
    try {
      const result = await StudentEntity.findOne({
        where: {
          user: user as FindOptionsWhere<UserEntity>,
        },
      });

      if (!result) {
        return {
          actionStatus: false,
          message: 'użytkownik nie istnieje w bazie',
        };
      }

      result.areDataPatched = false;
      result.reservationStatus = UserStatus.HIRED;

      await result.save();

      user.hash = null;
      user.isActive = false;

      await user.save();

      return {
        actionStatus: true,
        message: 'kursant zatrudniony, konto zostanie trwale zablokowane',
      };
    } catch (err) {
      console.log(err);
      return {
        actionStatus: false,
        message: 'Błąd serwera',
      };
    }
  }

  async addStudentdata(data: StudentExtendedData): Promise<UserResponse> {
    try {
      const user = await UserEntity.findOne({
        where: {
          email: data.email,
        },
      });

      if (!user)
        return {
          actionStatus: false,
          message: 'użytkownik nie istnieje w bazie',
        };

      const passwordValid = await comparer(
        data.password,
        user.hash,
        user.iv,
        user.salt,
      );

      if (!passwordValid)
        return {
          actionStatus: false,
          message: 'niepoprawne hasło',
        };

      const student = await StudentEntity.findOne({
        where: {
          user: user as FindOptionsWhere<UserEntity>,
        },
      });

      if (!student)
        return {
          actionStatus: false,
          message: 'Konto kursanta nie istnieje',
        };

      const githubValid = await StudentEntity.findOne({
        where: {
          githubUsername: data.githubUsername,
        },
      });

      if (githubValid) {
        return {
          actionStatus: false,
          message: 'podane konto github istnieje już w bazie',
        };
      }

      user.firstName = data.firstName;
      user.lastName = data.lastName;

      await user.save();

      student.tel = data.tel;
      student.githubUsername = data.githubUsername;
      student.portfolioUrls = JSON.stringify(data.portfolioUrls);
      student.githubUsername = data.githubUsername;
      student.portfolioUrls = JSON.stringify(data.portfolioUrls);
      student.projectUrls = JSON.stringify(data.projectUrls);
      student.bio = data.bio;
      student.expectedTypeWork = data.expectedTypeWork;
      student.targetWorkCity = data.targetWorkCity;
      student.expectedContractType = data.expectedContractType;
      student.expectedSalary = data.expectedSalary;
      student.canTakeApprenticeship = data.canTakeApprenticeship;
      student.monthsOfCommercialExp = data.monthsOfCommercialExp;
      student.education = data.education;
      student.workExperience = data.workExperience;
      student.courses = data.courses;
      student.areDataPatched = true;

      await student.save();

      return {
        actionStatus: true,
        message: 'dane zostały zapisane poprawnie',
      };
    } catch (err) {
      console.log(err);
      return {
        actionStatus: false,
        message: 'błąd serwera',
      };
    }
  }

  async patchStudentData(
    user: UserEntity,
    data: StudentExtendedDataPatch,
  ): Promise<UserResponse> {
    try {
      const student = await StudentEntity.findOne({
        where: {
          user: user as FindOptionsWhere<UserEntity>,
        },
      });

      if (!student) {
        return {
          actionStatus: false,
          message: 'taki kursant nie istnieje',
        };
      }

      const gitHubValid = await StudentEntity.find({
        where: {
          id: Not(student.id),
          githubUsername: data.githubUsername,
        },
      });

      if (gitHubValid.length > 0) {
        return {
          actionStatus: false,
          message: 'podane konto github istnieje już w bazie',
        };
      }

      user.firstName = data.firstName;
      user.lastName = data.lastName;

      await user.save();

      student.tel = data.tel;
      student.githubUsername = data.githubUsername;
      student.portfolioUrls = JSON.stringify(data.portfolioUrls);
      student.githubUsername = data.githubUsername;
      student.portfolioUrls = JSON.stringify(data.portfolioUrls);
      student.projectUrls = JSON.stringify(data.projectUrls);
      student.bio = data.bio;
      student.expectedTypeWork = data.expectedTypeWork;
      student.targetWorkCity = data.targetWorkCity;
      student.expectedContractType = data.expectedContractType;
      student.expectedSalary = data.expectedSalary;
      student.canTakeApprenticeship = data.canTakeApprenticeship;
      student.monthsOfCommercialExp = data.monthsOfCommercialExp;
      student.education = data.education;
      student.workExperience = data.workExperience;
      student.courses = data.courses;
      student.areDataPatched = true;

      await student.save();

      return {
        actionStatus: true,
        message: 'Dane zostały zaktualizowane',
      };
    } catch (err) {
      console.log(err);
      return {
        actionStatus: false,
        message: 'Błąd serwera',
      };
    }
  }

  async studentsSelectedByHr(user: UserEntity): Promise<UserResponse> {
    try {
      const hr = await HrEntity.findOne({
        where: {
          user: user as FindOptionsWhere<UserEntity>,
        },
        relations: {
          reservedStudents: true,
        },
      });

      if (!hr) {
        return {
          actionStatus: false,
          message: 'Nie istnieje w bazie HR o takim id',
        };
      }

      const students = hr.reservedStudents

      if (!students) {
        return {
          actionStatus: false,
          message: 'Nie masz wybranych żadnych studentów',
        };
      }

      const data = await Promise.all(students.map(async (student) => await listForHrFilter(student)))

      return {
        actionStatus: true,
        message: data,
      };
    } catch (e) {
      console.log(e);
      return {
        actionStatus: false,
        message: 'błąd serwera',
      };
    }
  }

  async getLogedStudentData(user: UserEntity): Promise<StudentExtendedDataPatch | string> {
    try {
      const student = await StudentEntity.findOne({
        where: {
          user: user as FindOptionsWhere<UserEntity>
        },
        relations: {
          user: true
        }
      });

      if (!student) return 'Błąd podczas wczytywania danych kursanta';

      const data = availabeForPatchStudentData(student);

      return data

    } catch (err) {
      console.log(err)
      return 'Błąd serwera'
    }
  }
}
