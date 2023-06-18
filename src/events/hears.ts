import { Client } from 'pg'
import { Telegraf, Markup } from 'telegraf'
import { TIMETABLE, CONTACT } from '../utils/const'
import { generateTimetable } from '../utils'

export function connectHears(bot: Telegraf, db: Client) {

  bot.hears(CONTACT, ctx => {
    ctx.replyWithHTML(`
      Address: <b>Haifa, Herzlia 16</b>
      \nTelephone: <b>0534257328</b>
      \nQuestions: @vialettochka
    `)
  })
    
  bot.hears(TIMETABLE, async ctx => {
    try {
      const result = await db.query('SELECT * FROM yoga.available_lessons ORDER BY date ASC;')
      const timetable = generateTimetable(result.rows)
      let header = '🗓 Choose a day:'

      if (timetable.reply_markup.inline_keyboard.length === 0) {
        header = 'The timetable is not ready yet'
      }

      ctx.reply(header, {
        ...timetable
      })
    } catch (e) {
      console.log(e)
    }
  })
} 
