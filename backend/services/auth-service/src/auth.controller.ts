import { Controller, Post, Body, UseGuards, Get, Request, Param, Patch } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto, RegisterDto, AuthResponseDto } from './dto/auth.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @Post('login')
    async login(@Body() loginDto: LoginDto): Promise<AuthResponseDto> {
        return this.authService.login(loginDto);
    }

    @Post('register')
    async register(@Body() registerDto: RegisterDto): Promise<AuthResponseDto> {
        return this.authService.register(registerDto);
    }

    @UseGuards(JwtAuthGuard)
    @Get('me')
    async getProfile(@Request() req) {
        return req.user;
    }

    @UseGuards(JwtAuthGuard)
    @Get('users')
    async getUsers(@Request() req, @Body() body: { role?: string }) {
        // Simple role check for now (only admin can list?)
        // In real app, use @Roles('ORG_ADMIN')
        return this.authService.getUsers(req.user.organizationId, req.query.role);
    }

    @UseGuards(JwtAuthGuard)
    @Patch('users/:id')
    async updateUser(@Param('id') id: string, @Body() updateData: any) {
        return this.authService.updateUser(id, updateData);
    }

    @UseGuards(JwtAuthGuard)
    @Get('validate')
    async validate(@Request() req) {
        return { valid: true, user: req.user };
    }
}
