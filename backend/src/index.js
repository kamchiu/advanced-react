require('dotenv').config({ path: 'variables.env' })
const cookieParser = require('cookie-parser')
const createServer = require('./createServer')
const jwt = require('jsonwebtoken')
const db = require('./db')

const server = createServer()

server.express.use(cookieParser())

server.express.use((req, res, next) => {
  const { token } = req.cookies
  if (token) {
    const { userId } = jwt.verify(token, process.env.APP_SECRET)
    req.userId = userId
  }
  next()
})

// create a middleware that populates the users on each request
server.express.use(async (req, res, next) => {
  // if they aren't logged in
  if (!req.userId) next()

  const user = await db.query.user(
    { where: { id: req.userId } },
    '{id, permissions, email, name}'
  )
  req.user = user
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
