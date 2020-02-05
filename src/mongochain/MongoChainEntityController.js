import mongoose from 'mongoose'
import MongoChainSenderModel from './MongoChainSenderModel'
import MongoChainRecipientModel from './MongoChainRecipientModel'

class MongoChainEntityController {

  async storeSender(req, res) {
    try {
      const sender = await MongoChainSenderModel.create(req.body)
      res.json(sender)
    } catch (err) {
      throw err
    }
  }

  async storeRecipient(req, res) {
    try {
      let recipient = await MongoChainRecipientModel.create(req.body)
      res.json(recipient)
    } catch (err) {
      throw err
    }
  }
}

export default new MongoChainEntityController()
