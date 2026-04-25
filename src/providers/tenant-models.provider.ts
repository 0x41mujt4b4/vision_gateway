import { Connection } from "mongoose";
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
    }
};
