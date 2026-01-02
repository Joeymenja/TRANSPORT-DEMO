import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Member } from '../entities/member.entity';
import { CreateMemberDto, UpdateMemberDto } from '../dto/member.dto';

@Injectable()
export class MemberService {
    constructor(
        @InjectRepository(Member)
        private readonly memberRepository: Repository<Member>,
    ) { }

    async createMember(createMemberDto: CreateMemberDto, organizationId: string): Promise<Member> {
        const member = this.memberRepository.create({
            ...createMemberDto,
            organizationId,
        });
        return this.memberRepository.save(member);
    }

    async findAll(organizationId: string): Promise<Member[]> {
        return this.memberRepository.find({
            where: { organizationId, isActive: true },
            order: { lastName: 'ASC', firstName: 'ASC' },
        });
    }

    async findOne(id: string, organizationId: string): Promise<Member> {
        const member = await this.memberRepository.findOne({
            where: { id, organizationId },
        });

        if (!member) {
            throw new NotFoundException(`Member with ID ${id} not found`);
        }

        return member;
    }

    async updateMember(id: string, updateMemberDto: UpdateMemberDto, organizationId: string): Promise<Member> {
        const member = await this.findOne(id, organizationId);
        Object.assign(member, updateMemberDto);
        return this.memberRepository.save(member);
    }

    async removeMember(id: string, organizationId: string): Promise<void> {
        const member = await this.findOne(id, organizationId);
        member.isActive = false;
        await this.memberRepository.save(member);
    }
}
