import User from './UserModel'

class UserController {
  async store(req, res) {
    try {
      const user = await User.create(req.body)
      return res.json(user)
    } catch (err) {
      throw err
    }
  }
}

export default new UserController()