import mongoose from 'mongoose'

const ACIDNoSQLChainBlockSchema = new mongoose.Schema({
  block: {
    type: Object
  }
})

export default mongoose.model('Block', ACIDNoSQLChainBlockSchema)