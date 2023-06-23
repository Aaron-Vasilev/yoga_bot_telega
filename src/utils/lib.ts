import type { Context } from 'telegraf'
import { generateTimetable } from '.'
import { Client } from 'pg'

export async function timetableCB(ctx: Context, db: Client) {
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
}
