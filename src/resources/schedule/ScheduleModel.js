import mongoose from 'mongoose'

const ScheduleSchema = new mongoose.Schema({
  title: {
    type: String
  },
  price: {
    type: Number
  },
  date: {
    type: String
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  establishmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Establishment'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
})

export default mongoose.model('Schedule', ScheduleSchema)