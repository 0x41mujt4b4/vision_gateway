import { Connection } from "mongoose";
import { Student, StudentSchema } from "src/student/student.schema";

export const tenantModelsProvider = {
    studentModel: {
        provide: 'STUDENT_MODEL',
        useFactory: async (tenantConnection: Connection) => {
            return tenantConnection.model(Student.name, StudentSchema);
        },
        inject: ['TENANT_CONNECTION']
    }
};