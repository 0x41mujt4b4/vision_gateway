import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

@Schema({ timestamps: true })
export class Student extends Document {
    @Prop({ required: true })
    name: string;
    @Prop({ required: true })
    time: string;
    @Prop({ required: true })
    feesAmount: number;
    @Prop({ required: true })
    feesType: string;
    @Prop({ required: true })
    course: string;
    @Prop({ required: true })
    level: string;
    @Prop({ required: true })
    session: string;
    /** Per-tenant incremental display id (allocated atomically on create). */
    @Prop({ type: Number, unique: true, sparse: true })
    studentNumber?: number;
    /** When the student paid (set at creation; absent on legacy rows). */
    @Prop({ type: Date })
    paymentDate?: Date;
    @Prop({ required: true })
    tenantId: string;
}

export const StudentSchema = SchemaFactory.createForClass(Student);