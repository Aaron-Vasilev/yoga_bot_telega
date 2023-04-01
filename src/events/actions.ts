import { Client } from 'pg'
import { Telegraf, Markup } from 'telegraf'
import { timetableText } from '../utils'
import { WEEKDAYS } from '../utils/const'

export function connectActions(bot: Telegraf, db: Client) {


  WEEKDAYS.forEach(weekday => {
    bot.action(weekday, async ctx => {
//      const result = await db.query('SELECT * FROM yoga.available_lessons WHERE date=$1;', [])
    })
  })

    const buttons = Markup.inlineKeyboard([
      Markup.button.callback('Register', 'reg_sun'),
    ])


  bot.action(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/, ctx => {
    console.log('† line 22 ctx', ctx)
    ctx.reply('You have succesfully registered on Sunday!')
  })
}
