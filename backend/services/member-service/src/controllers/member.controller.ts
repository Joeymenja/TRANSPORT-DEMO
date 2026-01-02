import { Controller, Get, Post, Body, Put, Param, Delete, Request, UseGuards } from '@nestjs/common';
import { MemberService } from '../services/member.service';
import { CreateMemberDto, UpdateMemberDto } from '../dto/member.dto';

@Controller('members')
export class MemberController {
    constructor(private readonly memberService: MemberService) { }

    @Post()
    create(@Body() createMemberDto: CreateMemberDto, @Request() req) {
        const organizationId = req.headers['x-organization-id'];
        return this.memberService.createMember(createMemberDto, organizationId);
    }

    @Get()
    findAll(@Request() req) {
        const organizationId = req.headers['x-organization-id'];
        return this.memberService.findAll(organizationId);
    }

    @Get(':id')
    findOne(@Param('id') id: string, @Request() req) {
        const organizationId = req.headers['x-organization-id'];
        return this.memberService.findOne(id, organizationId);
    }

    @Put(':id')
    update(@Param('id') id: string, @Body() updateMemberDto: UpdateMemberDto, @Request() req) {
        const organizationId = req.headers['x-organization-id'];
        return this.memberService.updateMember(id, updateMemberDto, organizationId);
    }

    @Delete(':id')
    remove(@Param('id') id: string, @Request() req) {
        const organizationId = req.headers['x-organization-id'];
        return this.memberService.removeMember(id, organizationId);
    }
}
