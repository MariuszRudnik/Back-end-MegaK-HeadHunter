import { ArgumentMetadata, Injectable, PipeTransform, NotAcceptableException } from "@nestjs/common";
import { UserEntity } from "src/auth/user.entity";
import { HrDto } from "src/hr/dto/hr-add.dto";




@Injectable()
export class NewHrUserValidation implements PipeTransform<HrDto, Promise<HrDto>> {

    async transform(data: HrDto, metadata: ArgumentMetadata): Promise<HrDto> {

        const emailAvailability = await UserEntity.findOne({
            where: {
                email: data.email
            }
        })

        if (emailAvailability) {
            throw new NotAcceptableException(Error, 'podany email istnieje już w bazie')
        };

        const correctEmail = data.email.includes('@');

        if (!correctEmail) {
            throw new NotAcceptableException(Error, 'niepoprawny format email')
        }

        if (data.firstName.length < 1 || data.company.length < 1 || data.lastName.length < 1) {
            throw new NotAcceptableException(Error, 'nie wszystkie wymagane pola zostały uzupełnione')
        }

        if (Number(data.maxReservedStudents) > 999 || Number(data.maxReservedStudents) < 1) {
            throw new NotAcceptableException(Error, 'niewłaściwa liczba możliwych rezerwacji')
        }

        return data;
    }
}