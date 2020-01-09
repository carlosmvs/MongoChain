import mongoose from 'mongoose'

const ACIDNoSQLChainMineSchema = new mongoose.Schema({
  mineAddress: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
})

export default mongoose.model('Mine', ACIDNoSQLChainMineSchema)