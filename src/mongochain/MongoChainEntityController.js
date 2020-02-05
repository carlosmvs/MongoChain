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

  async updateTransference(req, res) {
    const sessionTransference = await mongoose.startSession()
    sessionTransference.startTransaction({
      readConcern: { level: 'snapshot' },
      writeConcern: { w: 'majority' }
    })
    try {
      let sender = await MongoChainSenderModel.findById(req.body.senderId)
      let recipient = await MongoChainRecipientModel.findById(req.body.recipientId)
      let transference = await MongoChainTransferenceModel.findById(req.params.id)
      sender.amount -= (req.body.amount - 0.25)
      recipient.amount += req.body.amount
      transference.status = 'Concluído'
      await MongoChainSenderModel.findByIdAndUpdate(req.body.senderId, sender).session(sessionTransference)
      await MongoChainRecipientModel.findByIdAndUpdate(req.body.recipientId, recipient).session(sessionTransference)
      await MongoChainTransferenceModel.findByIdAndUpdate(req.params.id, transference).session(sessionTransference)
      await sessionTransference.commitTransaction()
      res.json({ message: "OK" })
    } catch (err) {
      await sessionTransference.abortTransaction()
    } finally {
      sessionTransference.endSession()
    }
  }

  async showTransferenceBySenderId(req, res) {
    try {
      const transferences = await MongoChainTransferenceModel.find()
      let senders = transferences.filter(sender => {
        return sender.senderId == req.params.id
      })
      res.json(senders)
    } catch (err) {
      throw err
    }
  }

  async showTransferenceByRecipientId(req, res) {
    try {
      const transferences = await MongoChainTransferenceModel.find()
      let recipients = transferences.filter(recipient => {
        return recipient.recipientId == req.params.id
      })
      res.json(recipients)
    } catch (err) {
      throw err
    }
  }
}

export default new MongoChainEntityController()
