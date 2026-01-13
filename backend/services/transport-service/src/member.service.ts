import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Member } from './entities/member.entity';

@Injectable()
export class MemberService {
    constructor(
        @InjectRepository(Member)
        private memberRepository: Repository<Member>,
    ) {}

    async findAll(organizationId: string): Promise<Member[]> {
        return this.memberRepository.find({
            where: { organizationId, isActive: true },
            order: { lastName: 'ASC' },
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

    async create(data: Partial<Member>, organizationId: string): Promise<Member> {
        const member = this.memberRepository.create({
            ...data,
            organizationId,
        });
        return this.memberRepository.save(member);
    }

    async update(id: string, data: Partial<Member>, organizationId: string): Promise<Member> {
        const member = await this.findOne(id, organizationId);
        Object.assign(member, data);
        return this.memberRepository.save(member);
    }
}
