import { Connection } from "mongoose";
import { InternalServerErrorException } from "@nestjs/common";
import { REQUEST } from "@nestjs/core";
import { getConnectionToken } from "@nestjs/mongoose";

export const tenantConnectionProvider = {
    provide: 'TENANT_CONNECTION',
    useFactory: async (request, connection: Connection) => {
        if (!request.tenantId) throw new InternalServerErrorException('Tenant ID is required');
        return connection.useDb(request.tenantId);
    },
    inject: [REQUEST, getConnectionToken()]
};