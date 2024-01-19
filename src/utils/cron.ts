import { Client } from 'pg'
import { Telegraf } from 'telegraf'
import { schedule } from 'node-cron'
import { UserMembership } from './types'
import { MembershipType, Message } from './const'

const studentSubscriptionEnds = (bot: Telegraf, db: Client) => 
  schedule('0 12 * * SUN', async () => {
    const date = new Date()
    const users = await db.query(`SELECT id, name, username, type, ends,
                                  lessons_avaliable as "lessonsAvaliable"
                                  FROM yoga.user JOIN yoga.membership ON id=user_id;`)

    users.rows.forEach((user: UserMembership) => {
      let message = `My cherry varenichek🥟🍒\n`

      if (user.type === MembershipType.noLimit) {
        message += `Kindly reminder, your membership ends <b>${user.ends}</b>`
      } else if (user.lessonsAvaliable <= 0 || new Date(user.ends) < date) {
        message += `When you come to my lesson next time, <b>remember to renew your membership</b>😚`
      } else {
        message += `Your membership ends <b>${user.ends}</b> and you still have <b>${user.lessonsAvaliable}</b> lessons🥳\nDon't forget to use them all🧞‍♀️`
      }
      message += `\n${Message.seeyou}`
      bot.telegram.sendMessage(user.id, message, { parse_mode: 'HTML' })
        .catch(_e => {})
    })
})

export async function runCron(bot: Telegraf,db: Client) {
  studentSubscriptionEnds(bot, db)
}

