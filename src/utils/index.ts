import { Markup } from "telegraf"
import { InlineKeyboardMarkup } from "telegraf/typings/core/types/typegram"
import { User, Lesson, LessonWithUsers } from "./types"
import { REGISTER, UNREGISTER, WEEKDAYS, YOGS } from "./const"

export function isAdmin(userId: number): boolean {
  return process.env.ADMIN.split(',').find(id => +id === userId) ? true : false
}

export function lessonIsValid(strings: string[]): boolean {
  let isValid = true

  if (strings.length < 3)
    isValid = false
  else if (!dateIsValid(strings[0]))
    isValid = false
  else if (!timeIsValid(strings[1]))
    isValid = false
  else if (strings[3] !== undefined && isNaN(+strings[3])) {
    isValid = false
  }

  return isValid
}

export function generateTimetable(lessons: Lesson[]): Markup.Markup<InlineKeyboardMarkup> {
  const timetable = []

  for (let i = 0; i < lessons.length; i++) {
    const { date, time } = lessons[i]
    const weekday = weekdayFromString(date)
    const layout = `${weekday} 🌀 ${beautyDate(date)} 🌀 ${beautyTime(time)}`

    timetable.push([Markup.button.callback(layout, `${date}T${time}`)])
  }

  return Markup.inlineKeyboard(timetable)
}

export function generateLessonText(lesson: LessonWithUsers): string {
  let text = `${weekdayFromString(lesson.date)} 🚀 ${beautyDate(lesson.date)} 🚀 ${beautyTime(lesson.time)} 🕒\n`
           + lesson.description + '\n'
           + `\nBooked: <b>${lesson.registered.length}</b>/${lesson.max}`
           + yogsEmoji(lesson.registered.length)

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
  let command = REGISTER
  let layout = 'Register for session'

  if (lesson.registered.find(user => user.id === userId)) {
    command = UNREGISTER
    layout = 'Unregister from session'
  }

  command += `T${lesson.lessonId}`

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

function dateIsValid(date: string): boolean {
  let isValid = true
  const [year, month, day] = date.split('-')

  if (year === undefined || month === undefined || day === undefined)
    isValid = false
  else if (year.length !== 4 || month.length !== 2 || month.length !== 2)
    isValid = false
  else if (Number.isInteger(+year)  === false ||
           Number.isInteger(+month) === false ||
           Number.isInteger(+day)   === false)
    isValid = false

  return isValid
}

function timeIsValid(time: string): boolean {
  let isValid = true
  const [hour, minute] = time.split(':')

  if (hour === undefined || minute === undefined)
    isValid = false
  else if (hour.length !== 2 || minute.length !== 2)
    isValid = false
  else if (Number.isInteger(+hour)  === false ||
           Number.isInteger(+minute) === false)
    isValid = false

  return isValid
}

function yogsEmoji(n: number): string {
  let res = ''

  for (let i = 0; i < n; i++) {
    let index = i % YOGS.length

    res += YOGS[index]
  }

  return res
}

function beautyDate(date: string): string {
  const [year, month, day] = date.split('-')

  return `${day}/${month}`
}

function beautyTime(time: string): string {
  const [hour, minute] = time.split(':')

  return `${hour}:${minute}`
}
