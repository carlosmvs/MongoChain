import { Router } from 'express'

const routesEstablishment = new Router()

import EstablishmentController from './EstablishmentController'

routesEstablishment.post('/establishments', EstablishmentController.store)

export default routesEstablishment