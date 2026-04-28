import { Injectable, NestMiddleware, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Request, Response, NextFunction } from "express";
import { Model } from "mongoose";
import { Tenant } from "src/tenants/schemas/tenant.schema";

/**
 * Request-scoped services (e.g. TENANT_CONNECTION) can be constructed before
 * route guards run. We must set tenant on the request here when using Bearer
 * auth so the tenant connection factory sees req.tenantId in time.
 */
@Injectable()
export class TenantMiddleware implements NestMiddleware {
    constructor(
        @InjectModel(Tenant.name) private tenantModel: Model<Tenant>,
    ) { }

    private ensureTenantIsActive(tenant: Tenant): void {
        if (tenant.status?.toLowerCase() !== 'active') {
            throw new UnauthorizedException("Tenant is disabled");
        }
    }

    private toRequestTenantContext(tenant: Tenant) {
        return {
            tenantId: String((tenant as unknown as { _id?: unknown })._id ?? ""),
            tenantDomain: tenant.domain,
            tenantDbName: tenant.dbName,
            isMasterTenant: tenant.isMaster === true,
        };
    }

    async use(req: Request, res: Response, next: NextFunction) {
        if (req.headers.authorization?.startsWith('Bearer ')) {
            const [type, token] = req.headers.authorization.split(" ") ?? [];
            if (type === "Bearer" && token) {
                const payload = this.parseJwtPayload(token);
                if (!payload?.tenantId) {
                    throw new UnauthorizedException("Invalid or malformed token");
                }
                const tenant = await this.tenantModel.findOne({ _id: payload.tenantId });
                if (!tenant && payload.tenantDomain) {
                    const tenantByDomain = await this.tenantModel.findOne({ domain: payload.tenantDomain });
                    if (!tenantByDomain) {
                        throw new NotFoundException("Tenant Not Found!");
                    }
                    this.ensureTenantIsActive(tenantByDomain);
                    const context = this.toRequestTenantContext(tenantByDomain);
                    req["tenantId"] = context.tenantId;
                    req["tenantDomain"] = context.tenantDomain;
                    req["tenantDbName"] = context.tenantDbName;
                    req["isMasterTenant"] = context.isMasterTenant;
                    return next();
                }
                if (!tenant) {
                    throw new NotFoundException("Tenant Not Found!");
                }
                this.ensureTenantIsActive(tenant);
                const context = this.toRequestTenantContext(tenant);
                req["tenantId"] = context.tenantId;
                req["tenantDomain"] = context.tenantDomain;
                req["tenantDbName"] = context.tenantDbName;
                req["isMasterTenant"] = context.isMasterTenant;
            } else {
                throw new UnauthorizedException("Missing or malformed authorization header");
            }
            return next();
        }

        const email = req.body?.email;
        const tenantDomainFromBody = req.body?.tenantDomain;
        const domain = typeof tenantDomainFromBody === 'string' && tenantDomainFromBody.trim() !== ''
            ? tenantDomainFromBody.trim().toLowerCase()
            : (typeof email === 'string' ? email.split('@')[1] : undefined);

        if (domain && typeof domain === 'string') {
            const tenant = await this.tenantModel.findOne({ domain })
            if (!tenant) {
                throw new NotFoundException("Tenant Not Found!")
            }
            this.ensureTenantIsActive(tenant);
            const context = this.toRequestTenantContext(tenant);
            req['tenantDomain'] = context.tenantDomain;
            req['tenantId'] = context.tenantId;
            req['tenantDbName'] = context.tenantDbName;
            req['isMasterTenant'] = context.isMasterTenant;
        }

        next();
    }

    private parseJwtPayload(token: string): { tenantId?: string; tenantDomain?: string } | null {
        const parts = token.split('.');
        if (parts.length !== 3) {
            return null;
        }
        try {
            const decoded = Buffer.from(parts[1], 'base64url').toString('utf8');
            return JSON.parse(decoded) as { tenantId?: string; tenantDomain?: string };
        } catch {
            return null;
        }
    }
}