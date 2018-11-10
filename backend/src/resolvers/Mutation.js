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
  }
}

module.exports = mutations
