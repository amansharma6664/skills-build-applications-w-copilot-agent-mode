import { Schema, model } from 'mongoose';

const workoutSchema = new Schema({
  title: { type: String, required: true },
  focus: { type: String, required: true },
  minutes: { type: Number, required: true, min: [1, 'minutes must be greater than 0'] },
  difficulty: { type: String, required: true },
});

export const Workout = model('Workout', workoutSchema);
