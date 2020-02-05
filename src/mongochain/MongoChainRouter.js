import { Router } from 'express'

const routesBlockchain = new Router()

import MongoChainController from './MongoChainController'

routesBlockchain.post('/blockchain/mongo', MongoChainController.storeBlockchainMongo)

routesBlockchain.get('/blockchain/mongo', MongoChainController.indexBlockchainMongo)

routesBlockchain.get('/blockchain/server', MongoChainController.indexBlockchainServer)

routesBlockchain.post('/node', MongoChainController.storeNode)

routesBlockchain.post('/node/multiple', MongoChainController.storeNodeMultiple)

routesBlockchain.post('/node/broadcast', MongoChainController.storeBroadcastNode)

routesBlockchain.post('/transaction', MongoChainController.storeTransaction)

routesBlockchain.post('/transaction/broadcast', MongoChainController.storeBroadcastTransaction)

routesBlockchain.post('/block', MongoChainController.storeBlock)

routesBlockchain.get('/mine', MongoChainController.indexMine)

routesBlockchain.get('/consensu', MongoChainController.indexConsensu)


routesBlockchain.post('/senders', MongoChainController.storeSender)

routesBlockchain.post('/recipients', MongoChainController.storeRecipient)

routesBlockchain.get('/recipients/:id', MongoChainController.showTransferenceByRecipientId)

routesBlockchain.put('/transferences/:id', MongoChainController.updateTransference)
routesBlockchain.get('/transferences/:senderId', MongoChainController.showTransferenceBySenderId)
routesBlockchain.get('/transferences/:recipientId', MongoChainController.showTransferenceByRecipientId)



export default routesBlockchain