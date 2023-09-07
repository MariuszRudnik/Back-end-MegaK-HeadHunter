import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { safetyConfiguration } from "config";
import { DecodedToken } from 'src/types';
import { verify } from 'jsonwebtoken';
import { UserEntity } from "src/auth/user.entity";

export const UserObject = createParamDecorator((data, context: ExecutionContext) => {

    const jwt = context.switchToHttp().getRequest().cookies.jwt;

    if (jwt) {
        const decoded = verify(jwt.accesToken, safetyConfiguration.jwtKey) as DecodedToken;
        const result = UserEntity.findOne({
            where: {
                jwt: decoded.id
            }
        })
        if (result) return result;

        return null
    }

    return null
});