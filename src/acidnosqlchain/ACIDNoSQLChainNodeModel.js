import mongoose from 'mongoose'

const ACIDNoSQLChainNodeSchema = new mongoose.Schema({
  newNodeUrl: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
})

export default mongoose.model('Node', ACIDNoSQLChainNodeSchema)