import { Client } from 'pg'
import { Scenes, Telegraf, session } from 'telegraf'
import { Command, InternalCmd, Message } from '../utils/const'
import { generateTimetable, isAdmin, userMembershipReply, isSingleEmoji, updateMembership, validUUID } from '../utils'
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

  const studentsPresentScence = new Scenes.WizardScene<any>(InternalCmd.signStudents,
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
        const lessonId = parseInt(ctx.message.text)
        const { rows } = await db.query(`SELECT registered, lesson_id as "lessonId"
                                         FROM yoga.registered_users 
                                         WHERE lesson_id=$1;`, [lessonId])
        ctx.wizard.state.registered = rows[0].registered
        ctx.wizard.state.currIndex = 0

        const userWithMembershipRes = 
          await db.query(`SELECT username, name, ends, lessons_avaliable AS "lessonsAvaliable" 
                          FROM yoga.user LEFT JOIN yoga.membership 
                          ON yoga.user.id = yoga.membership.user_id
                          WHERE id=$1`, [rows[0].registered[0]])

        
        ctx.replyWithHTML(userMembershipReply(userWithMembershipRes.rows[0]))

        return ctx.wizard.next()
      } catch (e) {
        console.log(e)
        return ctx.scene.leave()
      }
    },
    async (ctx) => {
      const registered =  ctx.wizard.state.registered
      const payload = ctx.message.text
      let currIndex = ctx.wizard.state.currIndex

      if (payload === 'YES') {
        await db.query(`UPDATE yoga.membership 
                        SET lessons_avaliable = lessons_avaliable - 1
                        WHERE user_id=$1`, [registered[currIndex]])
      }

      currIndex++

      if (registered[currIndex] === undefined) {
        ctx.reply('Good job!')
        return ctx.scene.leave()
      }

      const userWithMembershipRes = 
        await db.query(`SELECT username, name, ends, lessons_avaliable AS "lessonsAvaliable" 
                        FROM yoga.user LEFT JOIN yoga.membership 
                        ON yoga.user.id = yoga.membership.user_id
                        WHERE id=$1`, [registered[currIndex]])

      ctx.replyWithHTML(userMembershipReply(userWithMembershipRes.rows[0]))
      ctx.wizard.state.currIndex = currIndex

      return ctx.wizard.selectStep(2)
    }
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
    activateMembershipScence
  ])

  bot.use(session())
  bot.use(stage.middleware())

  //@ts-ignore
  bot.hears(InternalCmd.notify, async ctx => await ctx.scene.enter(Command.notificationScenario))
  //@ts-ignore
  bot.hears(InternalCmd.sign, async ctx => await ctx.scene.enter(InternalCmd.signStudents))
  //@ts-ignore
  bot.action(Command.changeEmoji, async ctx => await ctx.scene.enter(InternalCmd.changeEmoji))
  //@ts-ignore
  bot.action(Command.activateMembership, async ctx => await ctx.scene.enter(InternalCmd.activateMembership))
} 

export default connect(scenarios)
