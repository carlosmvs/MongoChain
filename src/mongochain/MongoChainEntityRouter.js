import { Router } from 'express'

const routesEntity = new Router()

import MongoChainEntityController from './MongoChainEntityController'



routesEntity.post('/senders', MongoChainEntityController.storeSender)

routesEntity.post('/recipients', MongoChainEntityController.storeRecipient)




export default routesEntity