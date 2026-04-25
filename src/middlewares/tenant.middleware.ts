import { Injectable, NestMiddleware, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Request, Response, NextFunction } from "express";
import { Model } from "mongoose";
import { Tenant } from "src/tenants/schemas/tenant.schema";


@Injectable()
export class TenantMiddleware implements NestMiddleware {
    constructor(@InjectModel(Tenant.name) private tenantModel: Model<Tenant>) { }

    async use(req: Request, res: Response, next: NextFunction) {
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
}