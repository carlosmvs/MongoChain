import { Router } from 'express'

const routesUser = new Router()

import UserController from './UserController'

routesUser.post('/users', UserController.store)

export default routesUser