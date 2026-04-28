import { Connection } from "mongoose";
import { RegistrationOptions, RegistrationOptionsSchema } from "src/registration-options/schemas/registration-options.schema";
import { Student, StudentSchema } from "src/student/schemas/student.schema";
import { User, UserSchema } from "src/users/schemas/user.schema";

export const tenantModelsProvider = {
    studentModel: {
        provide: 'STUDENT_MODEL',
        useFactory: async (tenantConnection: Connection) => {
            return tenantConnection.model(Student.name, StudentSchema);
        },
        inject: ['TENANT_CONNECTION']
    },
    userModel: {
        provide: 'USER_MODEL',
        useFactory: async (tenantConnection: Connection) => {
            return tenantConnection.model(User.name, UserSchema);
        },
        inject: ['TENANT_CONNECTION']
    },
    registrationOptionsModel: {
        provide: 'REGISTRATION_OPTIONS_MODEL',
        useFactory: async (tenantConnection: Connection) => {
            return tenantConnection.model(RegistrationOptions.name, RegistrationOptionsSchema);
        },
        inject: ['TENANT_CONNECTION']
    }
};
