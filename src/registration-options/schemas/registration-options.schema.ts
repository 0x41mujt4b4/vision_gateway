import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true, collection: 'tenant_config' })
export class RegistrationOptions extends Document {
    @Prop({ required: true, unique: true, default: 'registration-options' })
    key: string;

    @Prop({ type: [String], required: true })
    sessionOptions: string[];

    @Prop({ type: [String], required: true })
    courseOptions: string[];

    @Prop({ type: [String], required: true })
    levelOptions: string[];

    @Prop({ type: [String], required: true })
    timeOptions: string[];

    @Prop({ type: [String], required: true })
    feesTypeOptions: string[];

    @Prop({ type: Number, required: true })
    defaultFeesAmount: number;
}

export const RegistrationOptionsSchema = SchemaFactory.createForClass(RegistrationOptions);
