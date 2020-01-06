import { Router } from 'express'

const routesBlockchain = new Router()

import ACIDNoSQLChainController from './ACIDNoSQLChainController'

routesBlockchain.post('/blockchain', ACIDNoSQLChainController.storeBlockchain)

routesBlockchain.get('/blockchain/server', ACIDNoSQLChainController.indexBlockchainServer)

routesBlockchain.get('/blockchain', ACIDNoSQLChainController.indexBlockchain)

routesBlockchain.post('/node', ACIDNoSQLChainController.storeNode)

routesBlockchain.post('/node/multiple', ACIDNoSQLChainController.storeNodeMultiple)

routesBlockchain.get('/node', ACIDNoSQLChainController.indexNode)

routesBlockchain.post('/node/broadcast', ACIDNoSQLChainController.storeBroadcastNode)

routesBlockchain.post('/transaction', ACIDNoSQLChainController.storeTransaction)

routesBlockchain.post('/transaction/broadcast', ACIDNoSQLChainController.storeBroadcastTransaction)

routesBlockchain.post('/block', ACIDNoSQLChainController.storeBlock)

routesBlockchain.get('/mine', ACIDNoSQLChainController.indexMine)

routesBlockchain.get('/consensu', ACIDNoSQLChainController.indexConsensu)

routesBlockchain.get('/block/:blockHash', ACIDNoSQLChainController.getBlockByBlockchain)

routesBlockchain.get('/transaction/:transactionId', ACIDNoSQLChainController.getTransactionByTransactionId)

routesBlockchain.get('/address/:address', ACIDNoSQLChainController.getAddress)

export default routesBlockchain