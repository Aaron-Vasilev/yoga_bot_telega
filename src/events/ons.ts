import { Client } from 'pg'
import { Telegraf, Markup } from 'telegraf'

export function connectOns(bot: Telegraf, db: Client) {

  bot.on('text', async (ctx) => {
    await ctx.reply(`Hello ${ctx.message.from.first_name}`)
  })
}
