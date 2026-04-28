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
    @Prop({ required: true, default: false })
    isMaster: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export const TenantSchema = SchemaFactory.createForClass(Tenant);
TenantSchema.index(
    { isMaster: 1 },
    {
        unique: true,
        partialFilterExpression: { isMaster: true },
    },
);