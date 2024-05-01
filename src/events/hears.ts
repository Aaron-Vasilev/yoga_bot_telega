import { Client } from 'pg'
import { Telegraf } from 'telegraf'
import { Command, InternalCmd, Message, Sticker } from '../utils/const'
import { convertDateIntoString, generateKeyboard, isAdmin, profileBtns, profileText, typeIsPartOfMembTypes } from '../utils'
import { timetableCB, connect } from '../utils/lib'
import { randomUUID } from 'crypto'
import { UserMembership } from '@/utils/types'

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

  bot.hears(/EXTEND_\d/, async ctx => {
    if (!isAdmin(ctx.from.id)) return

    const daysToExtend = Number(ctx.message.text.split('_').at(1))

    const result = await db.query(`SELECT id, username, name, starts, ends,
                        lessons_avaliable as "lessonsAvaliable",
                        user_id as "userId", type, emoji
                        FROM yoga.user LEFT JOIN yoga.membership
                        ON yoga.user.id = yoga.membership.user_id
                        WHERE ends >= now()::DATE - 1;`)

    result.rows.forEach(async (m: UserMembership) => {
      const newEnd = new Date(m.ends)
      newEnd.setDate(newEnd.getDate() + daysToExtend)

      await ctx.telegram.sendMessage(m.userId, Message.prevMembership, {
        parse_mode: 'HTML'
      }).catch(_e => {})
      await ctx.telegram.sendMessage(m.userId, profileText(m), { 
        parse_mode: 'HTML' 
      }).catch(_e => {})
      await ctx.telegram.sendMessage(m.userId, Message.updatedMembership).catch(_e => {})
      m.ends = convertDateIntoString(newEnd)
      await db.query(`UPDATE yoga.membership SET ends=$1 
                      WHERE user_id=$2;`, [m.ends, m.userId])
      await ctx.telegram.sendMessage(m.userId, profileText(m), { 
        parse_mode: 'HTML' 
      }).catch(_e => {})

    })

    ctx.reply(`Subscriptins successfully updated for ${daysToExtend} days`)
  })
} 

export default connect(hears)

