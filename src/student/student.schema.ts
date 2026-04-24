import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

@Schema()
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
    session: string;
}

export const StudentSchema = SchemaFactory.createForClass(Student);