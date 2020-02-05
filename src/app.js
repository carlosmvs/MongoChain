import express from 'express'
import dotenv from 'dotenv'
dotenv.config()
import databaseMongo from './config/databaseMongo'
import routesMongoChain from './mongochain/MongoChainRouter'
import routesMongoChainEntity from './mongochain/MongoChainEntityRouter'

class APP {
  constructor() {
    this.server = express()
    this.database()
    this.middlewares()
    this.routes()
  }

  database() {
    databaseMongo.mongo()
  }

  middlewares() {
    this.server.use(express.json());
  }

  routes() {
    this.server.use(routesMongoChain, routesMongoChainEntity)
  }
}

export default new APP().server