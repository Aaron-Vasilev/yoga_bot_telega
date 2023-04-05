import { Client } from 'pg'
import { Telegraf, Markup } from 'telegraf'
import { TIMETABLE, CONTACT } from '../utils/const'

export function start(bot: Telegraf, db: Client) {

  bot.start(async ctx => {
    let header = 'Hey Bitch'
    const buttons = Markup.keyboard([[TIMETABLE, CONTACT]]).resize()
    const result = await db.query('SELECT * FROM yoga.user WHERE id=$1 LIMIT 1;', [ctx.from.id])

    if (result.rows.length === 0) {
      const { id, username, first_name } = ctx.from

      await db.query('INSERT INTO yoga.user (id, username, name) VALUES ($1, $2, $3);',
                     [id, username, first_name])

      header += ', you are new here'
    }

    ctx.reply(header, { ...buttons })
  })
}
