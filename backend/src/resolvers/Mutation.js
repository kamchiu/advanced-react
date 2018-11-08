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
  }
}

module.exports = mutations
