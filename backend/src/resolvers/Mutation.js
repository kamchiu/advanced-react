const bcrypt = require('bcryptjs') // for hashing password
const jwt = require('jsonwebtoken')
const { randomBytes } = require('crypto')
const { promisify } = require('util')
const { transport, makeANiceEmail } = require('../mail')
const { hasPermission } = require('../utils')

const mutations = {
  async createItem(parent, args, ctx, info) {
    if (!ctx.request.userId) {
      throw new Error('You must logged in')
    }
    const item = await ctx.db.mutation.createItem(
      {
        data: {
          user: {
            connect: {
              id: ctx.request.userId
            }
          },
          ...args
        }
      },
      info
    )

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
    const ownsItem = item.user.id === ctx.request.userId
    const hasPermissions = ctx.request.user.permissions.some(permission =>
      ['ADMIN', 'ITEMDELETE'].includes(permission)
    )

    if (!ownsItem && !hasPermissions) {
      throw new Error('you do not have permission to do that.')
    }

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
  signout(parent, args, ctx, info) {
    ctx.response.clearCookie('token')
    return {
      message: 'Goodbye!'
    }
  },
  async requestReset(parent, args, ctx, info) {
    // 1. check if this is a exist user
    const user = await ctx.db.query.user({ where: { email: args.email } })

    if (!user) {
      throw Error('No such user found!')
    }

    const resetToken = (await promisify(randomBytes)(20)).toString('hex')
    const resetTokenExpiry = Date.now() + 3600000
    const res = await ctx.db.mutation.updateUser({
      where: { email: args.email },
      data: { resetToken, resetTokenExpiry }
    })

    // send email
    const mailRes = await transport.sendMail({
      from: 'liujinchaona@gmail.com',
      to: user.email,
      subject: 'your password reset token',
      html: makeANiceEmail(`
      Your password reset token is here! \n\n <a href="${
        process.env.FRONTEND_URL
      }/reset?resetToken=${resetToken}">Click To Reset</a>`)
    })
    console.log(res)
    return { message: 'thanks' }
  },
  async resetPassword(parent, args, ctx, info) {
    // check if the passwords match
    if (args.password !== args.confirmPassword) {
      throw new Error('your passwords do not match')
    }

    // token是否过期
    const [user] = await ctx.db.query.users({
      where: {
        resetToken: args.resetToken,
        resetTokenExpiry_gte: Date.now() - 3600000
      }
    })
    if (!user) {
      throw new Error('This token is either invalid or expired')
    }

    // hash their new password
    const password = await bcrypt.hash(args.password, 10)

    // save the new password to db
    const updateUser = await ctx.db.mutation.updateUser({
      where: { email: user.email },
      data: {
        password,
        resetToken: null,
        resetTokenExpiry: null
      }
    })

    const token = jwt.sign({ userId: updateUser.id }, process.env.APP_SECRET)

    ctx.response.cookie('token', token, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 365
    })

    return updateUser
  },
  async updatePermissions(parent, args, ctx, info) {
    if (!ctx.request.userId) {
      throw new Error('you must logged in')
    }

    const currentUser = await ctx.db.query.user(
      {
        where: {
          id: ctx.request.userId
        }
      },
      info
    )
    hasPermission(currentUser, ['ADMIN', 'PERMISSIONUPDATE'])

    return ctx.db.mutation.updateUser(
      {
        data: {
          permissions: {
            set: args.permissions
          }
        },
        where: {
          id: args.userId
        }
      },
      info
    )
  },
  async addToCart(parent, args, ctx, info) {
    // 1. make sure they are signed in
    const { userId } = ctx.request
    // 2. query the users current cart
    const [existingCartItem] = await ctx.db.query.cartItems({
      user: { id: userId },
      item: { id: args.id }
    })

    // check if that item is already in their cart and inc 1 if it is
    if (existingCartItem) {
      console.log('this item is already in their cart')
      return ctx.db.mutation.updateCartItem(
        {
          where: { id: existingCartItem.id },
          data: { quantity: existingCartItem.quantity + 1 }
        },
        info
      )
    }

    // 4.if not in their cart
    return ctx.db.mutation.createCartItem(
      {
        data: {
          user: {
            connect: { id: userId }
          },
          item: {
            connect: { id: args.id }
          }
        }
      },
      info
    )
  },
  async removeFromCart(parent, args, ctx, info) {
    // 1. find the cart item
    const cartItem = await ctx.db.query.cartItem(
      {
        where: {
          id: args.id
        }
      },
      `{id, user { id }}`
    )
    // make sure we found an item
    if (!cartItem) throw new Error('No cartItem found')

    // 2. make sure they own the item
    if (cartItem.user.id !== ctx.request.userId) throw new Error('cheating')

    // 3. delete that item
    return ctx.db.mutation.deleteCartItem(
      {
        where: {
          id: args.id
        }
      },
      info
    )
  }
}

module.exports = mutations
