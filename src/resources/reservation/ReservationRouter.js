import { Router } from 'express'

const routesReservation = new Router()

import ReservationController from './ReservationController'

routesReservation.post('/reservations', ReservationController.store)
routesReservation.get('/reservations', ReservationController.index)

export default routesReservation