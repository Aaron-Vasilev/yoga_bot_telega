import { Client } from 'pg'
import { Telegraf } from 'telegraf'
import { convertDateIntoString } from '.'
import { VID } from './const'
import { UserMembership } from './types'

const sixHours = 1000 * 60 * 60 * 6

const studentSubscriptionEnds = (bot: Telegraf, db: Client) => setInterval(async () => {
  const date = new Date()
  const dateStr = convertDateIntoString(date)

  const users = await db.query(`SELECT name, username,
                                lessons_avaliable as "lessonsAvaliable"
                                FROM yoga.user JOIN yoga.membership
                                ON id=user_id WHERE ends=$1;`, [dateStr])

  let message = `Today the membership ends:\n`

  users.rows.forEach((user: UserMembership) => {
    message += `Name: <b>${user.name}</b>
User: <b>${user.username}</b>
Lessons remaining: <b>${user.lessonsAvaliable}</b>\n\n`
  })
  bot.telegram.sendMessage(VID, message, { parse_mode: 'HTML' })

}, sixHours)

export async function runCron(bot: Telegraf,db: Client) {
  studentSubscriptionEnds(bot, db)
}

