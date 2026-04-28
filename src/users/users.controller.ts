import { Controller, Delete, Get, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from './schemas/user.schema';
import UserDto from './dto/user.dto';
import { Body } from '@nestjs/common';
import { IsMasterTenant, TenantDomain, TenantId } from 'src/tenants/decorators/tenant.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RbacGuard } from 'src/auth/guards/rbac.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { Permissions } from 'src/auth/decorators/permissions.decorator';
import { Param } from '@nestjs/common';
import UpdateUserDto from './dto/update-user.dto';

@UseGuards(JwtAuthGuard, RbacGuard)
@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    @Post()
    @Roles('admin')
    @Permissions('users:create')
    createUser(
        @Body() user: UserDto,
        @TenantId() tenantId: string,
        @TenantDomain() tenantDomain: string,
        @IsMasterTenant() isMasterTenant: boolean,
    ): Promise<User> {
        if (!isMasterTenant) {
            user.tenantDomain = tenantDomain;
        }
        return this.usersService.createUser(user, tenantId);
    }

    @Get()
    @Roles('admin')
    @Permissions('users:read')
    getUserByEmail(@Query('email') email: string): Promise<User | undefined> {
        return this.usersService.getUserByEmail(email);
    }

    @Get('list')
    @Roles('admin')
    @Permissions('users:read')
    getUsersByTenant(@TenantId() tenantId: string): Promise<User[]> {
        return this.usersService.getUsersByTenant(tenantId);
    }

    @Patch(':id')
    @Roles('admin')
    @Permissions('users:create')
    updateUser(
        @Param('id') id: string,
        @Body() updates: UpdateUserDto,
        @TenantId() tenantId: string,
    ): Promise<User> {
        return this.usersService.updateUserById(id, tenantId, updates);
    }

    @Delete(':id')
    @Roles('admin')
    @Permissions('users:create')
    deleteUser(
        @Param('id') id: string,
        @TenantId() tenantId: string,
    ): Promise<boolean> {
        return this.usersService.deleteUserById(id, tenantId);
    }
}