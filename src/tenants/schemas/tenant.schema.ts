import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

@Schema({ timestamps: true })
export class Tenant extends Document {
    @Prop({ required: true })
    domain: string;
    @Prop({ required: true })
    name: string;
    @Prop({ required: true, unique: true })
    dbName: string;
    @Prop({ required: true, default: "active" })
    status: string;
    createdAt: Date;
    updatedAt: Date;
}

export const TenantSchema = SchemaFactory.createForClass(Tenant);