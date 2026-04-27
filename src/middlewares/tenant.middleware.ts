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

    async use(req: Request, res: Response, next: NextFunction) {
        if (req.headers.authorization?.startsWith('Bearer ')) {
            const [type, token] = req.headers.authorization.split(" ") ?? [];
            if (type === "Bearer" && token) {
                const payload = this.parseJwtPayload(token);
                if (!payload?.tenantId) {
                    throw new UnauthorizedException("Invalid or malformed token");
                }
                req["tenantId"] = payload.tenantId;
                req["tenantDomain"] = payload.tenantDomain;
            } else {
                throw new UnauthorizedException("Missing or malformed authorization header");
            }
            return next();
        }

        const email = req.body?.email;

        if (email && typeof email === 'string') {
            const domain = email.split('@')[1];
            const tenant = await this.tenantModel.findOne({ domain })
            if (!tenant) {
                throw new NotFoundException("Tenant Not Found!")
            }
            req['tenantDomain'] = domain;
            req['tenantId'] = tenant._id;
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