import { Injectable } from '@nestjs/common';
import { authLoginDto } from './dto/auth-login.dto';
import { Response } from 'express';
import { UserEntity } from './user.entity';
import { v4 as uuid } from 'uuid';
import { sign } from 'jsonwebtoken';
import { comparer, hasher } from './crypto';
import { frontConfiguration, safetyConfiguration } from 'config';
import { RegistrationData } from './dto/registration.dto';
import { randomSigns } from 'src/utils/random-signs';
import { PassChange } from './dto/pass-change.dto';
import { UserResponse } from 'src/types';
import { EmailChanging } from './dto/email-change.dto';
import { sendResetLink } from 'src/utils/email-handler';

interface JwtPayload {
    id: string
}

@Injectable()
export class AuthService {

    private createToken(currentTokneId: string): { accesToken: string, expiresIn: number } {
        const payload: JwtPayload = { id: currentTokneId };
        const expiresIn = safetyConfiguration.cookieExpires;
        const accesToken = sign(payload, safetyConfiguration.jwtKey, { expiresIn })
        return {
            accesToken,
            expiresIn
        }
    }

    private async generateToken(user: UserEntity): Promise<string> {
        let token: string;
        let UserWithThisToken = null;
        do {
            token = uuid();
            UserWithThisToken = await UserEntity.findOne({
                where: {
                    jwt: token
                }
            })
        } while (!!UserWithThisToken);
        user.jwt = token;
        await user.save();

        return token;
    }

    async login(req: authLoginDto, res: Response): Promise<any> {

        try {
            const user = await UserEntity.findOne({
                where: {
                    email: req.email
                }
            })

            if (!user) {
                return res.json({
                    logedIn: false,
                    message: 'Użytkownik o podanej nazwie nie istnieje',
                })
            }

            if (!user.isActive) {
                return res.json({
                    logedIn: false,
                    message: 'Konto nie jest aktywne',
                })
            }

            const isPasswordCorrect = await comparer(req.password, user.hash, user.iv, user.salt)

            if (!isPasswordCorrect) {
                return res.json({
                    logedIn: false,
                    message: 'Niepoprawne hasło',
                })
            }

            const token = this.createToken(await this.generateToken(user))

            return res.cookie('jwt', token, {
                secure: false,
                domain: frontConfiguration.domain,
                httpOnly: true
            })
                .json({
                    logedIn: true,
                    message: { role: user.role, firstName: user.firstName, lastName: user.lastName }
                })
        } catch (err) {
            console.log(err)
            res
                .status(500)
                .json({
                    logedIn: false,
                    message: 'Błąd serwera'
                })
        }
    }

    async register(data: RegistrationData, res: Response): Promise<any> {
        try {
            const result = await UserEntity.findOne({
                where: {
                    email: data.email
                }
            })

            if (!result) {
                return res.json({
                    actionStatus: false,
                    message: 'Użytkownik o podanym adresie email nie istnieje',
                })
            }

            if (result.link !== data.urlCode) {
                return res.json({
                    actionStatus: false,
                    message: 'niepoprawny kod aktywacyjny',
                })
            }

            if (data.password.length < 8) {
                return res.json({
                    actionStatus: false,
                    message: 'Hasło jest za krótkie',
                })
            }

            result.link = null;
            result.isActive = true;

            const salt = randomSigns(safetyConfiguration.saltLength)
            const code = await hasher(data.password, salt);

            result.salt = salt;
            result.hash = code.coded;
            result.iv = code.iv;

            await result.save();

            res.json({
                actionStatus: true,
                message: 'Hasło nadane, konto jest aktywne',
            })
        } catch (err) {
            console.log(err)
            res
                .status(500)
                .json({
                    actionStatus: false,
                    message: 'Błąd serwera',
                })
        }
    }

    async logout(user: UserEntity, res: Response): Promise<any> {

        try {
            user.jwt = null;
            await user.save();

            res
                .cookie('jwt', '')
                .json({
                    actionStatus: true,
                    message: 'wylogowano poprawnie'
                })
        } catch (err) {
            console.log(err)
            res
                .status(500)
                .json({
                    actionStatus: false,
                    message: 'błąd serwera'
                })
        }
    }

    async passwordChanging(user: UserEntity, data: PassChange): Promise<UserResponse> {

        try {
            const passValidation = await comparer(data.oldPassword, user.hash, user.iv, user.salt);

            if (!passValidation) {
                return {
                    actionStatus: false,
                    message: 'Niepoprawne hasło'
                }
            }

            if (data.newPassword.length < 8) {
                return {
                    actionStatus: false,
                    message: 'Nowe hasło jest za krótkie'
                }
            }

            const newSalt = randomSigns(safetyConfiguration.saltLength);
            const newPass = await hasher(data.newPassword, newSalt);

            user.hash = newPass.coded;
            user.iv = newPass.iv;
            user.salt = newSalt;

            await user.save();

            return {
                actionStatus: true,
                message: 'Hasło zostało zmienione'
            }

        } catch (err) {
            console.log(err)
            return {
                actionStatus: false,
                message: 'błąd serwera'
            }
        }
    }

    async emailChanging(user: UserEntity, data: EmailChanging): Promise<UserResponse> {

        try {
            const userValidation = await comparer(data.password, user.hash, user.iv, user.salt);

            if (!userValidation) {
                return {
                    actionStatus: false,
                    message: 'hasło jest nieprawidłowe'
                }
            }

            const emailValid = await UserEntity.findOne({
                where: {
                    email: data.newEmail
                }
            })

            if (emailValid) {
                return {
                    actionStatus: false,
                    message: 'podany email już istnieje w bazie'
                }
            }

            const SignValidator = data.newEmail.includes('@');

            if (!SignValidator) {
                return {
                    actionStatus: false,
                    message: 'niepoprawny format email'
                }
            }

            user.email = data.newEmail;
            await user.save();

            return {
                actionStatus: true,
                message: 'adres email został zmieniony'
            }

        } catch (err) {
            console.log(err)
            return {
                actionStatus: false,
                message: 'błąd serwera'
            }
        }
    }

    async sendResetPasswordLink(email: string): Promise<UserResponse> {

        try {
            const result = await UserEntity.findOne({
                where: {
                    email,
                }
            })

            if (!result) {
                return {
                    actionStatus: false,
                    message: 'podany email nie istnieje w bazie'
                }
            }

            result.link = randomSigns(safetyConfiguration.linkLength)

            await sendResetLink(result.link, email);
            await result.save()

            return {
                actionStatus: true,
                message: 'Link resetujący został wysłany'
            }
        } catch (err) {
            console.log(err)
            return {
                actionStatus: false,
                message: 'Błąd serwera'
            }
        }
    }
}
