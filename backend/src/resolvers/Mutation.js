const bcrypt = require('bcryptjs') // for hashing password
const jwt = require('jsonwebtoken')

const mutations = {
  async createItem(parent, args, ctx, info) {
    // TODO: check if they are login
    const item = await ctx.db.mutation.createItem(
      {
        data: {
          ...args
        }
      },
      info
    )

    console.log(item)
    return item
  },
  updateItem(parent, args, ctx, info) {
    // take a copy of the update item
    const updates = { ...args }

    delete updates.id

    return ctx.db.mutation.updateItem({
      data: updates,
      where: {
        id: args.id
      }
    })
  },
  async deleteItem(parent, args, ctx, info) {
    const where = { id: args.id }
    // 1. find the item
    const item = await ctx.db.query.item({ where }, `{ id title}`)
    // 2.check if they own that item, or have the permissions

    return ctx.db.mutation.deleteItem({ where }, info)
  },
  async signup(parent, args, ctx, info) {
    args.email = args.email.toLowerCase()

    const password = await bcrypt.hash(args.password, 10)

    // create user in database
    const user = await ctx.db.mutation.createUser(
      {
        data: {
          ...args,
          password,
          permissions: {
            set: ['USER']
          }
        }
      },
      info
    )
    // create a jwt for user
    const token = jwt.sign({ userId: user.id }, process.env.APP_SECRET)
    // we set the jwt as a cookie on the response
    ctx.response.cookie('token', token, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 365
    })

    return user
  },
  async signin(parent, { email, password }, ctx, info) {
    // check if there is a user with the email
    const user = await ctx.db.query.user({ where: { email } })
    if (!user) {
      throw new Error(`No such user found for email ${email}`)
    }

    // check if the password is correct
    const valid = await bcrypt.compare(password, user.password)
    if (!valid) {
      throw new Error('Invalid Password')
    }

    // generate the jwt token
    const token = jwt.sign({ userId: user.id }, process.env.APP_SECRET)
    ctx.response.cookie('token', token, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 365
    })

    return user
  },
  siginout(parent, args, ctx, info) {
    ctx.response.clearCookie('token')
    return {
      message: 'Goodbye!'
    }
  }
}

module.exports = mutations
