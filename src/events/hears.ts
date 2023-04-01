import { Client } from 'pg'
import { Telegraf, Markup } from 'telegraf'
import { TIMETABLE, CONTACT } from '../utils/const'
import { generateTimetable } from '../utils'

export function connectHears(bot: Telegraf, db: Client) {

  bot.hears(CONTACT, ctx => {
    ctx.replyWithHTML(`
      Address: <b>Haifa, Herzlia 16</b>
      \nTelephone <b>0534257328</b>
    `)
  })
    
  bot.hears(TIMETABLE, async ctx => {
    const result = await db.query('SELECT * FROM yoga.available_lessons;')
    const timetable = generateTimetable(result.rows)

    ctx.reply('Choose a day:', {
      ...timetable
    })
  })
} 
