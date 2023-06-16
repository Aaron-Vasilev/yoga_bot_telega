import { Client } from 'pg'
import { isAdmin, lessonIsValid } from '../utils'
import { Telegraf } from 'telegraf'

export function connectOns(bot: Telegraf, db: Client) {

  bot.on('text', async ctx => {
    try {
      if (isAdmin(ctx.from.id)) {
        const splitedMessage = ctx.message.text.split('\n')

        if (lessonIsValid(splitedMessage)) {
          const [date, time, description, maxStudents]: string[] = splitedMessage

          const result = await db.query(`INSERT INTO yoga.lesson 
                                         (date, time, description, max)
                                         VALUES ($1, $2, $3, $4) RETURNING id;`,
            [date, time, description, Number(maxStudents ?? 5)])

          await db.query(`INSERT INTO yoga.registered_users (lesson_id, registered)
                          VALUES ($1, $2);`, [result.rows[0].id, []])

          ctx.reply('New lesson is added')

          } else {
            ctx.reply('Your lesson is incorrect!🔫')
          }
      } else {
        ctx.reply(`Hello ${ctx.message.from.first_name}`)
      }
    } catch (e) {
      console.log('† line 31 e', e)
    }
  })
}
