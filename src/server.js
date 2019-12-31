import app from './app'
const port = process.argv[2]

app.listen(port, () => {
  console.log(`Listering on port.. ${port}`)
})