import mongoose from 'mongoose'

class Database {
  constructor() {
    this.mongo()
  }
  mongo() {
    mongoose.connect(
      process.env.DB_URL, {
      useNewUrlParser: true,
      useCreateIndex: true,
      useUnifiedTopology: true,
      useFindAndModify: false
    }
    )
  }
}

export default new Database()