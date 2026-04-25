import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { User } from './schemas/user.schema';
import { Model } from 'mongoose';
import UserDto from './dto/user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
    constructor(
        @Inject('USER_MODEL') private UserModel: Model<User>
    ) { }

    async getUserByEmail(email: string): Promise<User | undefined> {
        email = email.toLowerCase();
        const user = await this.UserModel.findOne({ email });
        if (!user) {
            throw new NotFoundException('User not found');
        }
        return user;
    }

    async createUser(user: UserDto, tenantId: string): Promise<User> {
        user.password = await bcrypt.hash(user.password, 10);
        user.name = user.name.toLowerCase();
        user.email = user.email.toLowerCase();
        return this.UserModel.create({ ...user, tenantId });
    }
}
