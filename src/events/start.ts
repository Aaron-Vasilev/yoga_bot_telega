import { Client } from 'pg'
import { Telegraf } from 'telegraf'
import { Message } from '../utils/const'
import { generateKeyboard } from '../utils'

export function start(bot: Telegraf, db: Client) {

  bot.start(async ctx => {
    const { id, username, first_name } = ctx.from
    await db.query(`INSERT INTO yoga.user (id, username, name)
                    VALUES ($1, $2, $3) ON CONFLICT (id) DO
                    UPDATE SET username=$2, name=$3;`, [id, username, first_name])

    ctx.reply(Message.greeting, { ...generateKeyboard() })
  })
}
