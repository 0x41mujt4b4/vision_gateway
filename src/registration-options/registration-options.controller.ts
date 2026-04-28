import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RbacGuard } from 'src/auth/guards/rbac.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { RegistrationOptionsService } from './registration-options.service';
import { UpdateRegistrationOptionsDto } from './dto/update-registration-options.dto';
import { RegistrationOptionsValue } from './default-registration-options';

@UseGuards(JwtAuthGuard, RbacGuard)
@Controller('registration-options')
export class RegistrationOptionsController {
    constructor(private readonly registrationOptionsService: RegistrationOptionsService) { }

    @Get()
    getOptions(): Promise<RegistrationOptionsValue> {
        return this.registrationOptionsService.getOptions();
    }

    @Patch()
    @Roles('admin')
    updateOptions(@Body() updates: UpdateRegistrationOptionsDto): Promise<RegistrationOptionsValue> {
        return this.registrationOptionsService.updateOptions(updates);
    }
}
