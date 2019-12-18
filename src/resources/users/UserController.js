import User from './UserModel'
import ACID from '../../utils/acid'

class UserController {
  async store(req, res){
    try{
    const { email } = req.body
    console.log(ACID.commitTransaction())
    if(await User.findOne( { email } )){
      return res.status(400).json({error: "User already exists"})
    }
    const user = await User.create(req.body)
    return res.json(user)
  }catch(err){
    
  }
  }



}

export default new UserController()