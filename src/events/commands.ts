import { Client } from "pg"
import { Telegraf } from "telegraf"

export function connectCommands(bot: Telegraf, db: Client) {

  bot.command('h', (ctx) => {
    const message = '<b>Bold</b>'

    ctx.replyWithMarkdownV2(message, { parse_mode: 'HTML' })
  })

}

