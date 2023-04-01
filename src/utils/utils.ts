import { Markup } from "telegraf"
import { User, Lesson } from "./types"
import { InlineKeyboardMarkup } from "telegraf/typings/core/types/typegram"

const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

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
    const weekday = weekdayFromString(lessons[i].date)
    const layout = `${weekday} ${lessons[i].date} ${lessons[i].registered.length}/5`

    timetable.push(Markup.button.callback(layout, weekday))
  }

  return Markup.inlineKeyboard(timetable)
}

function weekdayFromString(date: string): string {
  const [day, month, year] = date.split("-")
  const dateObject = new Date(+day, +month - 1, +year)

  return WEEKDAYS[dateObject.getDay()]
}
