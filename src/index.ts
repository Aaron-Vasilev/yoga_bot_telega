import dotenv from 'dotenv'
import http from 'http'
import pg, { Client } from 'pg'
import { Telegraf } from 'telegraf'
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


http.createServer((req, res) => {
  res.writeHead(200, {'Content-Type': 'text/plain'})
  res.write('Hello World!')
  res.end()
}).listen(+process.env.PORT)

bot.launch()
console.log('Launch!')
