import dotenv from 'dotenv'
import pg, { Client } from 'pg'
import { Telegraf, Markup } from 'telegraf'
import { TIMETABLE, CONTACT } from './utils/const'
import { connectCommands } from './events/commands'
import { connectActions } from './events/actions'
import { connectHears } from './events/hears'
import { connectOns } from './events/ons'

dotenv.config()
pg.types.setTypeParser(1082, (val) => val)

const db = new Client({
  connectionString: process.env.DB,
})
db.connect()

const bot = new Telegraf(String(process.env.TOKEN))
bot.start(ctx => {
  const buttons = Markup.keyboard([
    [TIMETABLE, CONTACT]
  ]).resize()

  ctx.reply('Hey Bitch', { ...buttons })
})

connectActions(bot, db)
connectCommands(bot, db)
connectHears(bot, db)
connectOns(bot, db)

bot.launch()
console.log('Launch!')

