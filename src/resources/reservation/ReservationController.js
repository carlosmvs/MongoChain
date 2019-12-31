import Reservation from './ReservationModel'

class ReservationController {

  async store(req, res) {
    try {
      const reservation = await Reservation.create(req.body)
      return res.json(reservation)
    } catch (err) {
      throw err
    }
  }
  async index(req, res) {
    try {
      const reservation = await Reservation.find()
      return res.json(reservation)
    } catch (err) {
      throw err
    }
  }
}

export default new ReservationController()