import Schedule from './ScheduleModel'

class ScheduleController {
  async index(req, res) {
    try {
      const schedule = await Schedule.find()
      return res.json(schedule)
    } catch (err) {
      throw err
    }
  }
}

export default new ScheduleController()