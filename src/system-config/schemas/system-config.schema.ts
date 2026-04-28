import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, SchemaTypes } from 'mongoose';

@Schema({ timestamps: true, collection: 'system_config' })
export class SystemConfig extends Document {
    @Prop({ required: true, unique: true })
    key: string;

    @Prop({ type: SchemaTypes.Mixed, required: true })
    value: unknown;
}

export const SystemConfigSchema = SchemaFactory.createForClass(SystemConfig);
