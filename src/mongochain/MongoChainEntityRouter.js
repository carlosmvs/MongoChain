import { Router } from 'express'

const routesEntity = new Router()

import MongoChainEntityController from './MongoChainEntityController'

routesEntity.post('/senders', MongoChainEntityController.storeSender)
routesEntity.post('/recipients', MongoChainEntityController.storeRecipient)

routesEntity.get('/transferences', MongoChainEntityController.indexTransference)
routesEntity.put('/transferences/:id', MongoChainEntityController.updateTransference)
routesEntity.delete('/transferences/:id', MongoChainEntityController.deleteTransference)
routesEntity.get('/transferences/:senderId', MongoChainEntityController.showTransferenceBySenderId)
routesEntity.get('/transferences/:recipientId', MongoChainEntityController.showTransferenceByRecipientId)

export default routesEntity