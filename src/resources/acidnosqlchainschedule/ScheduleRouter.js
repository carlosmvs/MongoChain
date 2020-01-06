import { Router } from 'express'

const routesSchedule = new Router()

import ScheduleController from './ScheduleController'

routesSchedule.get('/schedules', ScheduleController.index)

export default routesSchedule