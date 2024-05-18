import { Client } from 'pg'
import { Scenes, Telegraf, session } from 'telegraf'
import { Command, DATE, InternalCmd, Message, TIME } from '../utils/const'
import { generateTimetable, isAdmin, userMembershipReply, isSingleEmoji, updateMembership, validUUID, dateIsValid, beautyTime, timeIsValid } from '../utils'
import { Membership } from 'src/utils/types'
import { connect } from '../utils/lib'

async function scenarios(bot: Telegraf, db: Client) {

  const nofityScene = new Scenes.WizardScene<any>(InternalCmd.notificationScenario,
    async ctx => {
      if (isAdmin(ctx.from.id)) {
        ctx.reply(Message.typeNotification)
      } else {
        return ctx.scene.leave()
      }
      
      return ctx.wizard.next()
    },
    async ctx => {
      try {
        if (ctx.message.text.length > 5) {
          const result = await db.query('SELECT id FROM yoga.user;')

          result.rows.forEach(user => {
            ctx.telegram.sendMessage(user.id, ctx.message.text)
            .catch((_e: any) => { })
          })
        } else {
          ctx.reply(Message.error)
        }
      } catch (e) {
        console.log(e)
        ctx.reply(Message.error)
      } finally {
        return ctx.scene.leave()
      }
    }
  )

  const studentsPresentScence = new Scenes.WizardScene<any>(InternalCmd.sign,
    async ctx => {
      if (!isAdmin(ctx.from.id)) return ctx.scene.leave()
      const { rows } = await db.query('SELECT * FROM yoga.available_lessons ORDER BY date ASC;')
      const timetable = generateTimetable(rows, true)
      
      ctx.reply('Type ID', {
        ...timetable
      })
      return ctx.wizard.next()
    },
    async ctx => {
      try {
        const lessonId = ctx.message.text
        const { rows } = await db.query(`SELECT registered, lesson_id as "lessonId", date
                                         FROM yoga.registered_users JOIN yoga.lesson on id=lesson_id 
                                         WHERE lesson_id=$1;`, [lessonId])
        ctx.wizard.state.registered = rows[0].registered
        ctx.wizard.state.currIndex = 0
        ctx.wizard.state.date = rows[0].date
        ctx.wizard.state.lessonId = lessonId

        const userWithMembershipRes = 
          await db.query(`SELECT username, name, ends, lessons_avaliable AS "lessonsAvaliable" 
                          FROM yoga.user LEFT JOIN yoga.membership 
                          ON yoga.user.id = yoga.membership.user_id
                          WHERE id=$1`, [rows[0].registered[0]])

        
        ctx.replyWithHTML(userMembershipReply(userWithMembershipRes.rows[0]))

        return ctx.wizard.next()
      } catch (e) {
        console.error('✡️  line 73 e', e)
        return ctx.scene.leave()
      }
    },
    async (ctx) => {
      const registered =  ctx.wizard.state.registered
      const payload = ctx.message.text
      let currIndex = ctx.wizard.state.currIndex
      let userId = registered[currIndex]

      if (payload === 'YES') {
        const date = ctx.wizard.state.date
        const lessonId = ctx.wizard.state.lessonId

        await Promise.all([
          db.query(`INSERT INTO yoga.attendance 
                    (user_id, lesson_id, date) VALUES ($1, $2, $3);`, 
                    [userId, lessonId, date]),
          db.query(`UPDATE yoga.membership 
                    SET lessons_avaliable = lessons_avaliable - 1
                    WHERE user_id=$1;`, [userId])
        ]) 
      }

      currIndex++
      userId = registered[currIndex]

      if (userId === undefined) {
        ctx.reply('Good job!')
        return ctx.scene.leave()
      }

      const userWithMembershipRes = 
        await db.query(`SELECT username, name, ends, lessons_avaliable AS "lessonsAvaliable" 
                        FROM yoga.user LEFT JOIN yoga.membership 
                        ON yoga.user.id = yoga.membership.user_id
                        WHERE id=$1`, [userId])

      ctx.replyWithHTML(userMembershipReply(userWithMembershipRes.rows[0]))
      ctx.wizard.state.currIndex = currIndex

      return ctx.wizard.selectStep(2)
    }
  )

  const updateLesson = new Scenes.WizardScene<any>(InternalCmd.updateLesson,
    async ctx => {
      if (!isAdmin(ctx.from.id)) return ctx.scene.leave()
      const { rows } = await db.query('SELECT * FROM yoga.available_lessons ORDER BY date ASC;')
      const timetable = generateTimetable(rows, true)
      
      ctx.reply('Type ID', {
        ...timetable
      })
      return ctx.wizard.next()
    },
    async ctx => {
      const lessonId = ctx.message.text
      const { rows } = await db.query(`SELECT * FROM yoga.lesson WHERE id=$1;`, [lessonId])

      ctx.wizard.state.lesson = rows[0]

      ctx.reply('What do you want to change?', {
        reply_markup: {
          inline_keyboard: [
            [{ text: DATE, callback_data: DATE }],
            [{ text: TIME, callback_data: TIME }],
          ]
        }
      })

      return ctx.wizard.next()
    },
    async ctx => {
      const response = ctx?.update?.callback_query.data
      if (!response) return ctx.scene.leave()

      switch (response) {
        case DATE: {
          const message = `Type a date with a format <b>YYYY-MM-DD</b>\nCurrent: <b>${ctx.wizard.state.lesson.date}</b>`
          ctx.replyWithHTML(message)

          return ctx.wizard.selectStep(3)
        }
        case TIME: {
          const message = `Type a time in a 24 hours format <b>HH:MM</b>\nCurrent: <b>${beautyTime(ctx.wizard.state.lesson.time)}</b>`
          ctx.replyWithHTML(message)

          return ctx.wizard.selectStep(4)
        }
        default:
          return ctx.scene.leave()
      }
    },
    // 3 step update DATE
    async ctx => {
      const date =  ctx.message.text

      if (dateIsValid(date)) {
        await db.query('UPDATE yoga.lesson SET date=$1 WHERE id=$2', [date, ctx.wizard.state.lesson.id])
        ctx.reply('Date has been updated')
      } else {
        ctx.reply('Input date is not valid')
      }

      return ctx.scene.leave()
    },
    // 4 step update TIME
    async ctx => {
      const time = ctx.message.text

      if (timeIsValid(time)) {
        await db.query('UPDATE yoga.lesson SET time=$1 WHERE id=$2', [time, ctx.wizard.state.lesson.id])
        ctx.reply('Time has been updated')
      } else {
        ctx.reply('Input time is not valid')
      }

      return ctx.scene.leave()
    },
  )

  const changeEmojiScence = new Scenes.WizardScene<any>(InternalCmd.changeEmoji,
    ctx => {
      ctx.replyWithHTML(Message.sendEmoji)
      return ctx.wizard.next()
    },
    async ctx => {
      if (ctx?.message?.text && isSingleEmoji(ctx.message.text)) {
        await db.query(`UPDATE yoga.user SET emoji=$1
                        WHERE id=$2`, [ctx.message.text, ctx.from.id])
        ctx.reply(`Your new emoji: ${ctx.message.text}`)
      } else {
        ctx.reply(Message.passiveAggression)
      }

      return ctx.scene.leave()
    }
  )

  const activateMembershipScence = new Scenes.WizardScene<any>(InternalCmd.activateMembership,
    ctx => {
      ctx.reply('Send a token')
      return ctx.wizard.next()
    },
    async ctx => {
      try {
        if (!ctx?.message?.text) return ctx.reply(Message.passiveAggression)

        const uuid = ctx.message.text.trim()

        if (!validUUID(uuid)) return ctx.reply('It\'s not a token🚔🚨')

        const res = await db.query(`SELECT type, starts, ends, 
                                    lessons_avaliable as "lessonsAvaliable" 
                                    FROM yoga.membership WHERE user_id=$1;`, [ctx.from.id])

        const res2 = await db.query(`SELECT * FROM yoga.token WHERE id=$1`, [uuid])

        const membership: Membership = res.rows[0] ?? {
          userId: ctx.from.id,
          type: 0,
          starts: '2023-01-01',
          ends: '2023-01-01',
          lessonsAvaliable: 0
        }

        if (res.rows.length === 0) {
          const tmp = '2023-01-01'
          await db.query(`INSERT INTO yoga.membership (user_id, starts, ends, type, lessons_avaliable)
                          VALUES ($1,$2,$3,$4,$5);`,[ctx.from.id, tmp, tmp, 0, 0])
        }

        if (res2.rows[0].valid === false) return ctx.reply('Guilty🫵🏼')

        updateMembership(membership, res2.rows[0])
        const { type, starts, ends, lessonsAvaliable } = membership
        await db.query(`UPDATE yoga.membership SET type=$1,
                        starts=$2, ends=$3, lessons_avaliable=$4 WHERE user_id=$5;`, 
                        [type, starts, ends, lessonsAvaliable, ctx.from.id])

        await db.query(`UPDATE yoga.token SET valid=$1, user_id=$2
                        WHERE id=$3`, [false, ctx.from.id, uuid])

        ctx.reply('Gotcha🦾')
      } catch (e) {
        ctx.reply(Message.passiveAggression)
        console.log('† line 137 e', e)
      } finally {
        ctx.scene.leave()
      }
    }
  )

  const stage = new Scenes.Stage([
    nofityScene, 
    studentsPresentScence, 
    changeEmojiScence,
    activateMembershipScence,
    updateLesson,
  ])

  bot.use(session())
  bot.use(stage.middleware())

  //@ts-ignore
  bot.hears(InternalCmd.notify, async ctx => await ctx.scene.enter(InternalCmd.notificationScenario))
  //@ts-ignore
  bot.hears(InternalCmd.sign, async ctx => await ctx.scene.enter(InternalCmd.sign))
  //@ts-ignore
  bot.action(Command.changeEmoji, async ctx => await ctx.scene.enter(InternalCmd.changeEmoji))
  //@ts-ignore
  bot.action(Command.activateMembership, async ctx => await ctx.scene.enter(InternalCmd.activateMembership))
  //@ts-ignore
  bot.hears(InternalCmd.updateLesson, async ctx => await ctx.scene.enter(InternalCmd.updateLesson))
} 

export default connect(scenarios)
