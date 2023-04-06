import dotenv from 'dotenv'
import pg, { Client } from 'pg'
import { Telegraf, Markup } from 'telegraf'
import { TIMETABLE, CONTACT } from './utils/const'
import { connectCommands } from './events/commands'
import { connectActions } from './events/actions'
import { connectHears } from './events/hears'
import { connectOns } from './events/ons'
import { start } from './events/start'

dotenv.config()
pg.types.setTypeParser(1082, (val) => val)

const db = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
})
db.connect()

const bot = new Telegraf(String(process.env.TOKEN))

start(bot, db)
connectActions(bot, db)
connectCommands(bot, db)
connectHears(bot, db)
connectOns(bot, db)

bot.launch()
console.log('Launch!')
