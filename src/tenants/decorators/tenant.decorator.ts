import { createParamDecorator, ExecutionContext } from "@nestjs/common";

export const TenantId = createParamDecorator(
    (data: unknown, ctx: ExecutionContext) => {
        const req = ctx.switchToHttp().getRequest();
        return req.tenantId
    }
)

export const TenantDomain = createParamDecorator(
    (data: unknown, ctx: ExecutionContext) => {
        const req = ctx.switchToHttp().getRequest();
        return req.tenantDomain
    }
)
