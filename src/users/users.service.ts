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

@Injectable()
export class UsersService {
    constructor(
        @Inject('USER_MODEL') private UserModel: Model<User>
    ) { }

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
        if (user.email == null || String(user.email).trim() === '') {
            throw new BadRequestException('Email is required');
        }
        user.name = user.name.toLowerCase();
        user.email = user.email.toLowerCase();
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
}
