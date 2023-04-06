import { Client } from 'pg'
import { isAdmin, lessonIsValid } from '../utils'
import { Telegraf, Markup } from 'telegraf'

export function connectOns(bot: Telegraf, db: Client) {

  bot.on('text', async ctx => {
    if (isAdmin(ctx.from.id)) {
      const splitedMessage = ctx.message.text.split('\n')
      console.log('† line 9 splitedMessage', splitedMessage)

      if (lessonIsValid(splitedMessage)) {
        const result = await db.query(`INSERT INTO yoga.lesson (date, time, description)
                                      VALUES ($1, $2, $3) RETURNING id;`,
                                       [splitedMessage[0], splitedMessage[1], splitedMessage[2]])

        await db.query(`INSERT INTO yoga.registered_users (lesson_id, registered)
                        VALUES ($1, $2);`, [result.rows[0].id, []])
        
        ctx.reply('New lesson is added')
      } else {
        ctx.reply('Your lesson is incorrect!🔫')
      }
    } else {
      ctx.reply(`Hello ${ctx.message.from.first_name}`)
    }
  })
}
