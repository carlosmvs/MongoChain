import mongoose from 'mongoose'

const ACIDNoSQLChainRecipientSchema = new mongoose.Schema({
  recipient: {
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

export default mongoose.model('Recipient', ACIDNoSQLChainRecipientSchema)