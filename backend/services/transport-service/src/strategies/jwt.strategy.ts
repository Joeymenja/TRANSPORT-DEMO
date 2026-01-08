import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(private configService: ConfigService) {
        /**
         * CRITICAL SECURITY FIX:
         * Validates that JWT_SECRET is set before initializing JWT strategy
         *
         * Previous code: had fallback to hardcoded secret
         * Problem: Anyone with source code could forge authentication tokens
         *
         * Current code: Fails immediately if JWT_SECRET not configured
         * Why: Forces proper security configuration, no silent fallbacks
         *
         * This validation happens at application startup, so you'll know
         * immediately if configuration is missing, rather than discovering
         * it in production when someone exploits the hardcoded secret.
         *
         * See transport.module.ts for secret generation instructions
         */
        const secret = configService.get('JWT_SECRET');
        if (!secret) {
            throw new Error('CRITICAL: JWT_SECRET environment variable must be set. See transport.module.ts for details.');
        }
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), // Look for "Bearer token" in Authorization header
            ignoreExpiration: false, // Enforce token expiration (24h)
            secretOrKey: secret, // Use the validated secret
        });
    }

    async validate(payload: any) {
        return {
            userId: payload.sub,
            email: payload.email,
            role: payload.role,
            organizationId: payload.organizationId,
        };
    }
}
