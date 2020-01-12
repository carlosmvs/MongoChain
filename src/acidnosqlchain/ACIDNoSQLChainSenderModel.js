import mongoose from 'mongoose'

const ACIDNoSQLChainSenderSchema = new mongoose.Schema({
  sender: {
    type: String
  },
  amount: {
    type: Number
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
})

export default mongoose.model('Sender', ACIDNoSQLChainSenderSchema)