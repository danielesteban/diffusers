import { model, HydratedDocument, Model, Schema, Types } from 'mongoose';

interface Client {
  name: string;
  key: string;
  origin: string;
  user: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

interface SerializedClient {
  id: string;
  name: string;
  key: string;
  origin: string;
  createdAt: Date;
}

interface ClientMethods {
  serialize(): SerializedClient;
}

export type ClientDocument = HydratedDocument<Client, ClientMethods>;

const ClientSchema = new Schema<Client>({
  name: {
    type: String,
    required: true,
  },
  key: {
    type: String,
    required: true,
    index: true,
    unique: true,
  },
  origin: {
    type: String,
    required: true,
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  createdAt: { type: Date, index: -1 },
}, { timestamps: true });

ClientSchema.methods = {
  serialize() {
    const client = this;
    return {
      id: client.id.toString(),
      name: client.name,
      key: client.key,
      origin: client.origin,
      createdAt: client.createdAt,
    };
  },
};

export default model<Client, Model<Client, {}, ClientMethods>>('Client', ClientSchema);
