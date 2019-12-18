import express from 'express'
import routesBlockchain from './resources/blockchain/BlockchainRouter'
import routesUser from './resources/users/UserRouter'

class APP {
  constructor(){
    this.server = express()  
    this.middlewares()
    this.routes()
  }  
  
  middlewares() {
    this.server.use(express.json())
  }
  routes(){
    this.server.use(routesBlockchain, routesUser)
  }
}

export default new APP().server