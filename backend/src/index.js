require('dotenv').config({ path: 'variables.env' })
const cookieParser = require('cookie-parser')
const createServer = require('./createServer')
const jwt = require('jsonwebtoken')
const db = require('./db')

const server = createServer()

server.express.use(cookieParser())

server.express.use((req, res, next) => {
  console.log(req.cookies)
  const { token } = req.cookies
  if (token) {
    const { userId } = jwt.verify(token, process.env.APP_SECRET)
    req.userId = userId
  }
  next()
})
server.start(
  {
    cors: {
      credentials: true,
      origin: process.env.FRONTEND_URL
    }
  },
  deets => {
    console.log(`Server is now running on port http://localhost:${deets.port}`)
  }
)
