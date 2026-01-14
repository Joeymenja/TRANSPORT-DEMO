import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
    canActivate(context: ExecutionContext) {
        // Custom logic before activation
        return super.canActivate(context);
    }

    handleRequest(err, user, info) {
        // You can throw an exception based on either "info" or "err" arguments
        if (err || !user) {
            console.error('JWT Auth Guard Failed:', { 
                err, 
                user, 
                info: info?.message || info 
            });
            throw err || new UnauthorizedException();
        }
        return user;
    }
}
