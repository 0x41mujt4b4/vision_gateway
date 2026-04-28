import {
    BadRequestException,
    ConflictException,
    Inject,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { User } from './schemas/user.schema';
import { Model } from 'mongoose';
import UserDto from './dto/user.dto';
import * as bcrypt from 'bcrypt';
import UpdateUserDto from './dto/update-user.dto';

@Injectable()
export class UsersService {
    constructor(
        @Inject('USER_MODEL') private UserModel: Model<User>
    ) { }

    private resolveEmailForCreate(user: UserDto): string {
        const email = typeof user.email === 'string' ? user.email.trim().toLowerCase() : '';
        if (email.length > 0) {
            if (/\s/.test(email)) {
                throw new BadRequestException('Email/username must not contain spaces');
            }
            return email;
        }

        const username = typeof user.username === 'string' ? user.username.trim().toLowerCase() : '';
        const tenantDomain = typeof user.tenantDomain === 'string' ? user.tenantDomain.trim().toLowerCase() : '';
        if (!username || !tenantDomain) {
            throw new BadRequestException('Provide either email or username with tenantDomain');
        }
        if (/\s/.test(username) || /\s/.test(tenantDomain)) {
            throw new BadRequestException('Username and tenant domain must not contain spaces');
        }
        return `${username}@${tenantDomain}`;
    }

    async getUserByEmail(email: string | undefined): Promise<User | undefined> {
        if (email == null || String(email).trim() === '') {
            throw new BadRequestException('Query "email" is required');
        }
        email = email.toLowerCase();
        const user = await this.UserModel.findOne({ email });
        if (!user) {
            throw new NotFoundException('User not found');
        }
        return user;
    }

    async getUserByEmailAndTenant(
        email: string | undefined,
        tenantId: string | undefined,
    ): Promise<User | undefined> {
        if (email == null || String(email).trim() === '') {
            throw new BadRequestException('Query "email" is required');
        }
        if (tenantId == null || String(tenantId).trim() === '') {
            throw new BadRequestException('Tenant ID is required');
        }
        email = email.toLowerCase();
        const user = await this.UserModel.findOne({ email, tenantId });
        if (!user) {
            throw new NotFoundException('User not found');
        }
        return user;
    }

    async createUser(user: UserDto, tenantId: string): Promise<User> {
        if (user.password == null || String(user.password).length === 0) {
            throw new BadRequestException('Password is required');
        }
        if (user.name == null || String(user.name).trim() === '') {
            throw new BadRequestException('Name is required');
        }
        const resolvedEmail = this.resolveEmailForCreate(user);
        user.name = user.name.toLowerCase();
        user.email = resolvedEmail;
        user.role = user.role?.trim() || 'user';
        user.permissions = Array.isArray(user.permissions) && user.permissions.length > 0
            ? user.permissions
            : ['students:create', 'students:read'];

        const existing = await this.UserModel.findOne({ email: user.email });
        if (existing) {
            throw new ConflictException('A user with this email already exists');
        }

        user.password = await bcrypt.hash(user.password, 10);
        try {
            return await this.UserModel.create({ ...user, tenantId });
        } catch (err: unknown) {
            const code = err && typeof err === 'object' && 'code' in err ? (err as { code?: number }).code : undefined;
            if (code === 11000) {
                throw new ConflictException('A user with this email already exists');
            }
            throw err;
        }
    }

    async getUsersByTenant(tenantId: string | undefined): Promise<User[]> {
        if (tenantId == null || String(tenantId).trim() === '') {
            throw new BadRequestException('Tenant ID is required');
        }
        return this.UserModel.find({ tenantId: String(tenantId) });
    }

    async updateUserById(userId: string | undefined, tenantId: string | undefined, updates: UpdateUserDto): Promise<User> {
        if (userId == null || String(userId).trim() === '') {
            throw new BadRequestException('User ID is required');
        }
        if (tenantId == null || String(tenantId).trim() === '') {
            throw new BadRequestException('Tenant ID is required');
        }

        const payload: Partial<UserDto> = {};
        if (typeof updates.name === 'string' && updates.name.trim() !== '') {
            payload.name = updates.name.trim();
        }
        if (typeof updates.role === 'string' && updates.role.trim() !== '') {
            payload.role = updates.role.trim();
        }
        if (Array.isArray(updates.permissions)) {
            payload.permissions = updates.permissions;
        }
        if (typeof updates.password === 'string' && updates.password.length > 0) {
            payload.password = await bcrypt.hash(updates.password, 10);
        }

        const updatedUser = await this.UserModel.findOneAndUpdate(
            { _id: String(userId), tenantId: String(tenantId) },
            { $set: payload },
            { new: true },
        );
        if (!updatedUser) {
            throw new NotFoundException('User not found');
        }
        return updatedUser;
    }

    async deleteUserById(userId: string | undefined, tenantId: string | undefined): Promise<boolean> {
        if (userId == null || String(userId).trim() === '') {
            throw new BadRequestException('User ID is required');
        }
        if (tenantId == null || String(tenantId).trim() === '') {
            throw new BadRequestException('Tenant ID is required');
        }

        const result = await this.UserModel.deleteOne({ _id: String(userId), tenantId: String(tenantId) });
        if ((result.deletedCount ?? 0) === 0) {
            throw new NotFoundException('User not found');
        }
        return true;
    }
}
