import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { User } from './entities/user.entity';
import { LoginDto, RegisterDto, AuthResponseDto } from './dto/auth.dto';

@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        private readonly jwtService: JwtService,
    ) { }

    async login(loginDto: LoginDto): Promise<AuthResponseDto> {
        console.log(`[DEBUG] Login attempt for email: "${loginDto.email}"`);
        try {
            const user = await this.userRepository.findOne({
                where: { email: loginDto.email, isActive: true },
                relations: ['organization'],
            });

            if (!user) {
                console.log(`[DEBUG] User not found for email: "${loginDto.email}"`);
                throw new UnauthorizedException('Invalid credentials');
            }

            // Defensive check for password hash
            if (!user.passwordHash) {
                console.error(`[ERROR] User ${user.id} has no password hash`);
                throw new UnauthorizedException('Invalid credentials (system error)');
            }

            console.log(`[DEBUG] User found. Verifying password...`);
            const isPasswordValid = await bcrypt.compare(loginDto.password, user.passwordHash);

            if (!isPasswordValid) {
                console.log(`[DEBUG] Password invalid for user ${user.email}`);
                throw new UnauthorizedException('Invalid credentials');
            }

            // Defensive check for organization
            if (!user.organization) {
                console.error(`[CRITICAL] User ${user.email} (ID: ${user.id}) has no linked organization! relations=['organization'] was requested.`);
                throw new Error('User organization data missing');
            }

            if (!user.organization.isActive) {
                throw new UnauthorizedException('Organization is inactive');
            }

            return this.generateAuthResponse(user);
        } catch (error) {
            console.error('[LOGIN ERROR]', error);
            throw error;
        }
    }

    async register(registerDto: RegisterDto): Promise<AuthResponseDto> {
        const existingUser = await this.userRepository.findOne({
            where: {
                email: registerDto.email,
                organizationId: registerDto.organizationId
            },
        });

        if (existingUser) {
            throw new UnauthorizedException('User already exists');
        }

        const hashedPassword = await bcrypt.hash(registerDto.password, 10);

        const user = this.userRepository.create({
            email: registerDto.email,
            passwordHash: hashedPassword,
            firstName: registerDto.firstName,
            lastName: registerDto.lastName,
            role: registerDto.role,
            organizationId: registerDto.organizationId,
            phone: registerDto.phone,
            isActive: true,
        });

        const savedUser = await this.userRepository.save(user);
        const userWithOrg = await this.userRepository.findOne({
            where: { id: savedUser.id },
            relations: ['organization'],
        });

        return this.generateAuthResponse(userWithOrg);
    }

    async validateUser(userId: string): Promise<User> {
        const user = await this.userRepository.findOne({
            where: { id: userId, isActive: true },
            relations: ['organization'],
        });

        if (!user || !user.organization.isActive) {
            throw new UnauthorizedException('Invalid user');
        }

        return user;
    }

    async getUsers(organizationId: string, role?: string): Promise<User[]> {
        const query: any = { organizationId, isActive: true };
        if (role) {
            query.role = role;
        }
        return this.userRepository.find({ where: query });
    }

    async updateUser(id: string, updateData: Partial<User>): Promise<User> {
        const user = await this.userRepository.findOne({ where: { id } });
        if (!user) {
            throw new UnauthorizedException('User not found');
        }
        Object.assign(user, updateData);
        return this.userRepository.save(user);
    }

    private generateAuthResponse(user: User): AuthResponseDto {
        const payload = {
            sub: user.id,
            email: user.email,
            role: user.role,
            organizationId: user.organizationId
        };

        return {
            accessToken: this.jwtService.sign(payload),
            user: {
                id: user.id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                role: user.role,
                organizationId: user.organizationId,
            },
        };
    }
}
