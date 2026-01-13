import { Controller, Get, Post, Put, Body, Param, Request, NotFoundException } from '@nestjs/common';
import { MemberService } from './member.service';
import { Member } from './entities/member.entity';

@Controller('members')
export class MemberController {
    constructor(private readonly memberService: MemberService) {}

    @Get()
    async getMembers(@Request() req): Promise<Member[]> {
        const organizationId = req.headers['x-organization-id'];
        return this.memberService.findAll(organizationId);
    }

    @Get(':id')
    async getMember(@Param('id') id: string, @Request() req): Promise<Member> {
        const organizationId = req.headers['x-organization-id'];
        return this.memberService.findOne(id, organizationId);
    }

    @Post()
    async createMember(@Body() data: Partial<Member>, @Request() req): Promise<Member> {
        const organizationId = req.headers['x-organization-id'];
        return this.memberService.create(data, organizationId);
    }

    @Put(':id')
    async updateMember(
        @Param('id') id: string,
        @Body() data: Partial<Member>,
        @Request() req
    ): Promise<Member> {
        const organizationId = req.headers['x-organization-id'];
        return this.memberService.update(id, data, organizationId);
    }
}
