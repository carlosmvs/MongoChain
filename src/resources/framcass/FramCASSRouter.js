import { Router } from 'express'

const routesBlockchain = new Router()

import FramCASSController from './FramCASSController'

routesBlockchain.get('/blockchain', FramCASSController.indexBlockchain)

routesBlockchain.post('/transaction', FramCASSController.storeTransaction)

routesBlockchain.post('/transaction/broadcast', FramCASSController.broadcastTransaction)

routesBlockchain.get('/mine/:_id', FramCASSController.mineBlock)

routesBlockchain.post('/receive-new-block', FramCASSController.receiveNewBlock)

routesBlockchain.post('/register-and-broadcast-node', FramCASSController.registerAndBroadcastNode)

routesBlockchain.post('/register-node', FramCASSController.registerNewNode)

routesBlockchain.post('/register-nodes-bulk', FramCASSController.registerNodeBulk)

routesBlockchain.get('/consensus', FramCASSController.consensus)

routesBlockchain.get('/block/:blockHash', FramCASSController.getBlockByBlockchain)

routesBlockchain.get('/transaction/:transactionId', FramCASSController.getTransactionByTransactionId)

routesBlockchain.get('/address/:address', FramCASSController.getAddress)

export default routesBlockchain