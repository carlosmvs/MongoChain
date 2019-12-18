import express from 'express'
import routesBlockchain from './blockchain/BlockchainRouter'
import routesUser from './users/UserRouter'

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