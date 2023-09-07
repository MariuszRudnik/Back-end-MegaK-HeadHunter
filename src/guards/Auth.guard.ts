import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { safetyConfiguration } from 'config';
import { verify } from 'jsonwebtoken';
import { UserEntity } from 'src/auth/user.entity';
import { DecodedToken } from 'src/types';
import { Reflector } from "@nestjs/core";


@Injectable()
export class AuthGuard implements CanActivate {

    constructor(
        private reflector: Reflector
    ) {
    }

    async canActivate(
        context: ExecutionContext,
    ): Promise<any> {

        const role = this.reflector.get<string>('role', context.getHandler());

        const jwt = context.switchToHttp().getRequest().cookies.jwt;

        if (!jwt) {
            throw new UnauthorizedException()
        }

        const decoded = verify(jwt.accesToken, safetyConfiguration.jwtKey) as DecodedToken

        const result = await UserEntity.findOne({
            where: {
                jwt: decoded.id
            }
        })

        if (!result) {
            throw new UnauthorizedException()
        }

        if (role) {
            if (role !== result.role) {
                throw new UnauthorizedException()
            }
        }

        return true;
    }
}