import { Markup } from "telegraf"
import { InlineKeyboardMarkup } from "telegraf/typings/core/types/typegram"
import { User, Lesson, LessonWithUsers } from "./types"
import { REGISTER, UNREGISTER, WEEKDAYS } from "./const"

export function timetableText(users: User[]): string {
  let res = `People registered <b>${users.length}/5</b>\n`

  users.forEach((user, i) => {
    res += `${i + 1}. ${user.name} \n`
  })

  return res
}


export function generateTimetable(lessons: Lesson[]): Markup.Markup<InlineKeyboardMarkup> {
  const timetable = []

  for (let i = 0; i < lessons.length; i++) {
    const { date, time } = lessons[i]
    const weekday = weekdayFromString(date)
    const layout = `${weekday} ${date} ${time}`

    timetable.push([Markup.button.callback(layout, `${date}T${time}`)])
  }

  return Markup.inlineKeyboard(timetable)
}

export function generateLessonText(lesson: LessonWithUsers): string {
  let text = `${weekdayFromString(lesson.date)} ${lesson.date} ${timeWitoutSeconds(lesson.time)}`
           + `\nBooked <b>${lesson.registered.length}</b>/5\n`

  if (lesson.registered.length > 0) {
    lesson.registered.forEach((user, i) => {
      let name = ''

      if (user.username)
        name += '@' + user.username
      else
        name += user.name

      text += `\n${i + 1}. ${name}`
    })
  }

  return text
}

export function generateLessonButton(userId: number, lesson: LessonWithUsers): Markup.Markup<InlineKeyboardMarkup> {
  console.log('† line 51 userId', userId)
  console.log('† line 51 lesson', lesson)
  let command = REGISTER
  let layout = 'Register for session'

  if (lesson.registered.find(user => user.id === userId)) {
    command = UNREGISTER
    layout = 'Unregister from session'
  }

  command += `T${lesson.lessonId}`
  console.log('† line 62 command', command)

  return Markup.inlineKeyboard([Markup.button.callback(layout, command)])
}

function weekdayFromString(date: string): string {
  const [day, month, year] = date.split('-')
  const dateObject = new Date(+day, +month - 1, +year)

  return WEEKDAYS[dateObject.getDay()]
}

function timeWitoutSeconds(time: string): string {
  const [hours, minutes] = time.split(':')
  return `${hours}:${minutes}`
}
