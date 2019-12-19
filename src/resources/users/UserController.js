import User from './UserModel'
import ACID from '../../utils/acid'

const ca = new ACID();

class UserController {
  async store(req, res) {
    try {
      ca.commitTransaction()
      console.log('ok')
      const user = await User.create(req.body)
      return res.json(user)

    } catch (err) {
      ca.cancelTransaction()
      console.log('erro')
    }
  }
}

export default new UserController()