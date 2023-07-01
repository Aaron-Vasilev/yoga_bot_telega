import { Client } from 'pg'
import { Scenes, Telegraf, session } from 'telegraf'
import { Command, Message } from '../utils/const'
import { isAdmin } from '../utils'

export function connectScenarios(bot: Telegraf, db: Client) {

  const nofityScene = new Scenes.WizardScene<any>(Command.notificationScenario,
    ctx => {
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

  const stage = new Scenes.Stage([nofityScene])

  bot.use(session())
  bot.use(stage.middleware())

  //@ts-ignore
  bot.hears(Command.notify, async ctx => await ctx.scene.enter(Command.notificationScenario))
} 
