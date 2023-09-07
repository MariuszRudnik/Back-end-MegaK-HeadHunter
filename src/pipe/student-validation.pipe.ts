import { HttpService } from "@nestjs/axios";
import { AxiosResponse } from "axios"
import { ArgumentMetadata, Injectable, PipeTransform, NotAcceptableException } from "@nestjs/common";
import { StudentExtendedDataPatch } from "src/student/dto/extended-data.dto";
import { ExpectedContractType, ExpectedTypeWork } from "src/types/user/user.register.type";
import { lastValueFrom, map, Observable } from 'rxjs';

@Injectable()
export class StudentExtensionDataValidate implements PipeTransform<StudentExtendedDataPatch, Promise<StudentExtendedDataPatch>> {

    constructor(
        private readonly httpService: HttpService
    ) { }

    async getGithubUsername(userName: string): Promise<Observable<Object>> {
        return lastValueFrom(this.httpService.get(`https://api.github.com/users/${userName}`)
          .pipe(
            map((res: AxiosResponse) => res.data))
        ).catch(() => {
            throw new NotAcceptableException(Error, 'Konto github o podanej nazwie użytkownika nie istnieje.')
        });
    }

    async transform(data: StudentExtendedDataPatch, metadata: ArgumentMetadata): Promise<StudentExtendedDataPatch> {

        if (data.firstName.length < 1 || data.lastName.length < 1) {
            throw new NotAcceptableException(Error, 'należy podać imię i nazwisko');
        }

        await this.getGithubUsername(data.githubUsername);

        if (data.projectUrls.length < 1) {
            throw new NotAcceptableException(Error, 'wymagane jest podanie urli do projektu zaliczeniowego');
        }

        const expectedTypeWork = Object.values(ExpectedTypeWork);
        const typeWorkValid = expectedTypeWork.includes(data.expectedTypeWork);

        if (!typeWorkValid) {
            throw new NotAcceptableException(Error, 'niepoprawny typ preferowanego miejsca pracy');
        }

        const expectedContractType = Object.values(ExpectedContractType);
        const expectedContractValid = expectedContractType.includes(data.expectedContractType);

        if (!expectedContractValid) {
            throw new NotAcceptableException(Error, 'niepoprawny typ preferowanego kontraktu');
        }

        if (data.canTakeApprenticeship === true) {
            data.canTakeApprenticeship = false;
        }

        if (!Number.isInteger(data.monthsOfCommercialExp)) {
            throw new NotAcceptableException(Error, 'niepoprawny format miesięcy doświadczenia');
        }

        if (data.monthsOfCommercialExp < 0) {
            throw new NotAcceptableException(Error, 'niepoprawny format miesięcy doświadczenia');
        }

        return data
    }
}