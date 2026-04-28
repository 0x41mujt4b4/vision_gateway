import { Connection } from "mongoose";
import { InternalServerErrorException, Scope } from "@nestjs/common";
import { REQUEST } from "@nestjs/core";
import { getConnectionToken } from "@nestjs/mongoose";

export const tenantConnectionProvider = {
    provide: 'TENANT_CONNECTION',
    scope: Scope.REQUEST,
    useFactory: async (request, connection: Connection) => {
        if (!request.tenantId) throw new InternalServerErrorException('Tenant ID is required');
        const tenantDb = request.tenantDbName ?? `tenant_${request.tenantDomain ?? request.tenantId}`;
        return connection.useDb(tenantDb);
    },
    inject: [REQUEST, getConnectionToken()]
};
