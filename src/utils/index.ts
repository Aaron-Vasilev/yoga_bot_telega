import { Markup } from "telegraf"
import { InlineKeyboardMarkup } from "telegraf/typings/core/types/typegram"
import { User, Lesson } from "./types"
import { WEEKDAYS } from "./const"


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

function weekdayFromString(date: string): string {
  const [day, month, year] = date.split("-")
  const dateObject = new Date(+day, +month - 1, +year)

  return WEEKDAYS[dateObject.getDay()]
}
