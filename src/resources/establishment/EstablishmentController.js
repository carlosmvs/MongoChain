import Establishment from './EstablishmentModel'

class EstablishmentController {
  async store(req, res) {
    try {
      const establishment = await Establishment.create(req.body)
      return res.json(establishment)
    } catch (err) {
      throw err
    }
  }
}

export default new EstablishmentController()