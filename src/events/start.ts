import { Client } from 'pg'
import { Telegraf, Markup } from 'telegraf'
import { TIMETABLE, CONTACT } from '../utils/const'

export function start(bot: Telegraf, db: Client) {

  bot.start(async ctx => {
    let header = 'Hello to all my dear yoga students! I hope you are feeling healthy and happy. I look forward to practice together. See you on the mat!🤍'
    const { id, username, first_name } = ctx.from
    const buttons = Markup.keyboard([[TIMETABLE, CONTACT]]).resize()
    const result = await db.query('SELECT * FROM yoga.user WHERE id=$1 LIMIT 1;', [id])

    if (result.rows.length === 0) {
      await db.query('INSERT INTO yoga.user (id, username, name) VALUES ($1, $2, $3);',
        [id, username, first_name])

    } else {
      await db.query('UPDATE yoga.user SET username=$1, name=$2 where id=$3;',
        [username, first_name, id])
    }

    ctx.reply(header, { ...buttons })
  })
}
