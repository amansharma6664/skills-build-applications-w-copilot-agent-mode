import { Schema, model } from 'mongoose';

const activitySchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  team: { type: Schema.Types.ObjectId, ref: 'Team', required: true },
  type: { type: String, required: true },
  minutes: { type: Number, required: true, min: [1, 'minutes must be greater than 0'] },
  points: { type: Number, required: true, min: [0, 'points must be greater than or equal to 0'] },
  occurredAt: { type: Date, required: true },
});

export const Activity = model('Activity', activitySchema);
