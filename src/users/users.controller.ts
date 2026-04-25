import { Controller, Get, Post, Query, Req } from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from './schemas/user.schema';
import UserDto from './dto/user.dto';
import { Body } from '@nestjs/common';
import { TenantId } from 'src/tenants/decorators/tenant.decorator';

@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    @Post()
    createUser(@Body() user: UserDto, @TenantId() tenantId: string): Promise<User> {
        console.log("the provided tenant is: ", tenantId);
        return this.usersService.createUser(user, tenantId);
    }

    @Get()
    getUserByEmail(@Query('email') email: string): Promise<User | undefined> {
        return this.usersService.getUserByEmail(email);
    }
}