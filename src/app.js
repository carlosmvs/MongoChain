import express from 'express'
import dotenv from 'dotenv'
dotenv.config()
import databaseMongo from './config/databaseMongo'
import routesBlockchain from './resources/framcass/FramCASSRouter'
import routesEstablishment from './resources/establishment/EstablishmentRouter'
import routesUser from './resources/user/UserRouter'
import routesSchedule from './resources/schedule/ScheduleRouter'
import routesReservation from './resources/reservation/ReservationRouter'

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
    this.server.use(routesBlockchain, routesEstablishment, routesUser, routesSchedule, routesReservation)
  }
}

export default new APP().server