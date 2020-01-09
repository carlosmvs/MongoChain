import mongoose from 'mongoose'

const ACIDNoSQLChainNotificationSchema = new mongoose.Schema({
  message: {
    type: String
  }
})

export default mongoose.model('Notification', ACIDNoSQLChainNotificationSchema)