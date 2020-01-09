import { Router } from 'express'

const routesBlockchain = new Router()

import ACIDNoSQLChainController from './ACIDNoSQLChainController'

routesBlockchain.post('/blockchain/mongo', ACIDNoSQLChainController.storeBlockchainMongo)

routesBlockchain.get('/blockchain', ACIDNoSQLChainController.indexBlockchain)

routesBlockchain.get('/blockchain/mongo', ACIDNoSQLChainController.indexBlockchainMongo)

routesBlockchain.post('/mine/mongo', ACIDNoSQLChainController.storeMineMongo)

routesBlockchain.post('/node', ACIDNoSQLChainController.storeNode)

routesBlockchain.post('/node/multiple', ACIDNoSQLChainController.storeNodeMultiple)

routesBlockchain.get('/node', ACIDNoSQLChainController.indexMineMongo)

routesBlockchain.post('/node/broadcast', ACIDNoSQLChainController.storeBroadcastNode)

routesBlockchain.post('/transaction', ACIDNoSQLChainController.storeTransaction)

routesBlockchain.post('/transaction/broadcast', ACIDNoSQLChainController.storeBroadcastTransaction)

routesBlockchain.post('/block', ACIDNoSQLChainController.storeBlock)

routesBlockchain.get('/mine', ACIDNoSQLChainController.indexMine)

routesBlockchain.get('/consensu', ACIDNoSQLChainController.indexConsensu)

export default routesBlockchain