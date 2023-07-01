import fs from 'fs'
import path from 'path'
import { Client } from 'pg'
import { Markup, Telegraf } from 'telegraf'
import { Command, Message, Sticker } from '../utils/const'
import { isAdmin } from '../utils'
import { timetableCB } from '../utils/lib'

export function connectHears(bot: Telegraf, db: Client) {

  bot.hears(Command.contact, ctx => {
    ctx.replyWithHTML(Message.contact)
  })
    
  bot.hears(Command.timetable, async ctx => timetableCB(ctx, db))

  bot.hears(Command.newTimetable, async ctx => {
    try {
      if (isAdmin(ctx.from.id)) {
        const result = await db.query('SELECT id FROM yoga.user;')

        result.rows.forEach(user => {
          ctx.telegram.sendSticker(user.id, Sticker.pinkSheepMeditating)
          .then(() => { 
            ctx.telegram.sendMessage(user.id, Message.timtableUpdated, {
                reply_markup: {
                  inline_keyboard: [[
                    { 
                      text: Command.timetable,
                      callback_data: Command.timetable
                    }
                  ]]
                }
              })
          })
          .catch((_e) => { })
        })
      }
    } catch (e) {
      console.log(e)
    }
  })

  bot.hears('Timetable', ctx => {
    const photo = fs.createReadStream(path.join(__dirname, '../../IMG_2643.jpg'))
    const caption = `Тебе надо почистить историю сообщений как на картинке\nYou need to clear the messages history`

    ctx.replyWithPhoto({ source: photo }, { caption })
  })
} 
