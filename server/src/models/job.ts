import { model, Schema, Types } from 'mongoose';

interface Job {
  client?: Types.ObjectId;
  pipeline: 'depth' | 'diffusion' | 'upscale';
  createdAt: Date;
}

const JobSchema = new Schema<Job>({
  client: {
    type: Schema.Types.ObjectId,
    ref: 'Client',
    index: true,
  },
  pipeline: {
    type: String,
    enum: ['depth', 'diffusion', 'upscale'],
    required: true,
    index: true,
  },
  createdAt: { type: Date, index: -1 },
}, { timestamps: { updatedAt: false } });

export default model<Job>('Job', JobSchema);
