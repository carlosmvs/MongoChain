import mongoose from 'mongoose'

const MongoChainSenderSchema = new mongoose.Schema({
  name: {
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

export default mongoose.model('Sender', MongoChainSenderSchema)