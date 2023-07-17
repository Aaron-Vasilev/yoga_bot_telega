import type { Context, Telegraf } from 'telegraf'
import { Client } from 'pg'
import { generateTimetable } from '.'

type Fn = (bot: Telegraf, db: Client) => Promise<void>

export function connect(fn: Fn) {
  return async (bot: Telegraf, db: Client) => {
    try {
      fn.call(this, bot, db)
    } catch (e) {
      console.log(fn.name, e)
    }
  }
}

export async function timetableCB(ctx: Context, db: Client): Promise<void> {
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
