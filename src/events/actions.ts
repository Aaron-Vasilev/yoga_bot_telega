import { Client } from 'pg'
import { generateLessonButton, generateLessonText } from '../utils'
import { Telegraf, Markup } from 'telegraf'
import { Command, Message, REGISTER, UNREGISTER } from '../utils/const'
import { timetableCB } from '../utils/lib'

export function connectActions(bot: Telegraf, db: Client) {

  bot.action(Command.timetable, ctx => timetableCB(ctx, db))

  bot.action(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/, async ctx => {
    if ('data' in ctx.update.callback_query) {
      const [date, time] = ctx.update.callback_query.data.split('T')
      const result = await db.query('SELECT yoga.get_lesson($1, $2);', [date, time])

      const lessonText = generateLessonText(result.rows[0].get_lesson)
      const button = generateLessonButton(ctx.from.id, result.rows[0].get_lesson)

      ctx.replyWithHTML(lessonText, button)
    } else {
      ctx.reply(Message.error)
    }
  })


  bot.action(/^[R,U]T\d+$/, async ctx => {
    if ('data' in ctx.update.callback_query) {
      const [register, lessonId] = ctx.update.callback_query.data.split('T')
      let message = ''

      switch (register) {
        case REGISTER:
          await db.query(`UPDATE yoga.registered_users 
                          SET registered = array_append(registered, $1)
                          WHERE lesson_id=$2;`, [ctx.from.id, lessonId])
          message = Message.register
          break;

        case UNREGISTER:
          await db.query(`UPDATE yoga.registered_users
                          SET registered = array_remove(registered, $1)
                          WHERE lesson_id=$2;`, [ctx.from.id, lessonId])
          message = Message.unregister
          break;

      }

      ctx.reply(message)
    } else {
      ctx.reply(Message.error)
    }
  })
}
