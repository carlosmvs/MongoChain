import mongoose from 'mongoose'

const MongoChainBlockSchema = new mongoose.Schema({
  block: {
    type: Object
  }
})

export default mongoose.model('Block', MongoChainBlockSchema)