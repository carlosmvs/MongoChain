import { Router } from 'express'

const routesBlockchain = new Router()

import BlockchainController from './BlockchainController'

routesBlockchain.get('/blockchain', BlockchainController.index)

routesBlockchain.post('/transaction', BlockchainController.storeTransaction)

routesBlockchain.post('/transaction/broadcast', BlockchainController.broadcastTransaction)

routesBlockchain.get('/mine', BlockchainController.mineBlock)

routesBlockchain.post('/receive-new-block', BlockchainController.receiveNewBlock)

routesBlockchain.post('/register-and-broadcast-node', BlockchainController.registerAndBroadcastNode)

routesBlockchain.post('/register-node', BlockchainController.registerNewNode)

routesBlockchain.post('/register-nodes-bulk', BlockchainController.registerNodeBulk)

routesBlockchain.get('/consensus', BlockchainController.consensus)

routesBlockchain.get('/block/:blockHash', BlockchainController.getBlockByBlockchain)

routesBlockchain.get('/transaction/:transactionId', BlockchainController.getTransactionByTransactionId)

routesBlockchain.get('/address/:address', BlockchainController.getAddress)

export default routesBlockchain