import { Client } from 'pg'
import { Telegraf } from 'telegraf'
import { Command, InternalCmd, Message, Sticker } from '../utils/const'
import { convertDateIntoString, generateKeyboard, isAdmin, profileBtns, profileText, typeIsPartOfMembTypes } from '../utils'
import { timetableCB, connect } from '../utils/lib'
import { Token } from 'src/utils/types'
import { randomUUID } from 'crypto'

export async function hears(bot: Telegraf, db: Client) {

  bot.hears(Command.contact, ctx => {
    ctx.replyWithHTML(Message.contact)
  })
    
  bot.hears(Command.timetable, async ctx => timetableCB(ctx, db))

  bot.hears(InternalCmd.newTimetable, async ctx => {
    if (!isAdmin(ctx.from.id)) return

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
  })

  bot.hears(InternalCmd.sendToAll, async ctx => {
    if (!isAdmin(ctx.from.id)) return

    const result = await db.query('SELECT id FROM yoga.user;')

    result.rows.forEach(user => {
      ctx.telegram.sendMessage(user.id, Message.botUpdated, {
        ...generateKeyboard() 
      })
      .catch((_e: any) => { })
    })
  })

  bot.hears(Command.profile, async ctx => {
    const {
      rows 
    } = await db.query(`SELECT id, username, name, starts, ends,
                        lessons_avaliable as "lessonsAvaliable",
                        user_id as "userId", type, emoji
                        FROM yoga.user LEFT JOIN yoga.membership
                        ON yoga.user.id = yoga.membership.user_id
                        WHERE id=$1;`, [ctx.from.id])

    
    ctx.replyWithHTML(profileText(rows[0]), { ...profileBtns() })
  })

  bot.hears(/GENERATE_\d/, async ctx => {
    if (!isAdmin(ctx.from.id)) return

    const type = Number(ctx.message.text.split('_').at(1))
    const uuid = randomUUID()
    const created = convertDateIntoString(new Date())

    if (!typeIsPartOfMembTypes(type)) return ctx.reply(Message.error)

    await db.query(`INSERT INTO yoga.token (id, type, created, valid)
                    VALUES ($1,$2,$3,$4)`, [uuid, type, created, true])

    ctx.reply(uuid)
  })
} 

export default connect(hears)

