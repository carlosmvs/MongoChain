import mongoose from 'mongoose'

const BlockchainSchema = new mongoose.Schema({
  block: {
    type: Object
  }
})

export default mongoose.model('Blockchain', BlockchainSchema)