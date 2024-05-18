import { Markup } from "telegraf"
import { InlineKeyboardMarkup, ReplyKeyboardMarkup } from "telegraf/typings/core/types/typegram"
import emojiRegex from "emoji-regex"
import { User, Lesson, LessonWithUsers, Membership, Token, UserMembership, UserWithCount } from "./types"
import { ADMINS, Command, MembershipType, REGISTER, UNREGISTER, WEEKDAYS } from "./const"

const { oneTime, twoTimes, noLimit } = MembershipType

export function isAdmin(userId: number): boolean {
  return ADMINS.find(id => id === userId) ? true : false
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

export function generateTimetable(lessons: Lesson[], showId = false ): Markup.Markup<InlineKeyboardMarkup> {
  const timetable = []

  for (const lesson of lessons) {
    const { date, time } = lesson
    const weekday = weekdayFromString(date)
    let layout = `${weekday} 🌀 ${beautyDate(date)} 🌀 ${beautyTime(time)}`

    if (showId) layout += ` ID = ${lesson.id}`

    timetable.push([Markup.button.callback(layout, `${date}T${time}`)])
  }

  return Markup.inlineKeyboard(timetable)
}

export function generateLessonText(lesson: LessonWithUsers): string {
  let text = `${weekdayFromString(lesson.date)} 🚀 ${beautyDate(lesson.date)} 🚀 ${beautyTime(lesson.time)} 🕒\n`
           + lesson.description + '\n'
           + `\nBooked: <b>${lesson.registered.length}</b>/${lesson.max}`
           + yogsEmoji(lesson.registered)

  if (lesson.registered.length > 0) {
    lesson.registered.forEach((user, i) => {
      text += `\n${i + 1}. ${userName(user)}`
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

export function dateIsValid(date: string): boolean {
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

export function timeIsValid(time: string): boolean {
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

function yogsEmoji(users: User[]): string {
  let res = ''

  users.forEach(user => res += user.emoji)

  return res
}

function beautyDate(date: string): string {
  const [year, month, day] = date.split('-')

  return `${day}/${month}`
}

export function beautyTime(time: string): string {
  const [hour, minute] = time.split(':')

  return `${hour}:${minute}`
}

function updateMembershipLessons(mmbshp: Membership, token: Token) {
  if (token.type === oneTime) mmbshp.lessonsAvaliable += 4 
  else if (token.type === twoTimes) mmbshp.lessonsAvaliable += 8 
  else if (token.type === noLimit) mmbshp.lessonsAvaliable = 0
}

function updateActiveMembership(
  mmbshp: Membership,
  mmbshpEndsDate: Date
) {
  const membershipLasts = 28

  mmbshpEndsDate.setDate(mmbshpEndsDate.getDate() + membershipLasts)
  mmbshp.ends = convertDateIntoString(mmbshpEndsDate)
}

function
updateExpiredMembership(mmbshp: Membership, tokenCreatedDate: Date)
{
  const daysRemaining = 27

  mmbshp.starts = convertDateIntoString(tokenCreatedDate)
  tokenCreatedDate.setDate(tokenCreatedDate.getDate() + daysRemaining)
  mmbshp.ends = convertDateIntoString(tokenCreatedDate)
}

export function updateMembership(mmbshp: Membership, token: Token) {
  const tokenCreatedDate = new Date(token.created)
  let mmbshpEndsDate = new Date(mmbshp.ends)

  if (mmbshpEndsDate >= tokenCreatedDate)
    updateActiveMembership(mmbshp, mmbshpEndsDate)
  else {
    updateExpiredMembership(mmbshp, tokenCreatedDate)
    mmbshp.lessonsAvaliable = 0
  }

  updateMembershipLessons(mmbshp, token)

  mmbshp.type = token.type
}

export function typeIsPartOfMembTypes(type: number): boolean {
  return type === oneTime || type === twoTimes || type === noLimit
}

export function convertDateIntoString(date: Date): string {
  const year = date.getFullYear()
  let month: number | string = date.getMonth() + 1
  let day: number | string = date.getDate()

  if (day < 10) day = '0' + day
  if (month < 10) month = '0' + month

  return `${year}-${month}-${day}`
}

type UserMemb = Pick<User, 'name' | 'username'> & Pick<Membership, 'lessonsAvaliable' | 'ends'>

export function userMembershipReply (userMemb: UserMemb): string {
  return 'Type YES or NO:\n' + 
    `<b>${userMemb.name} - ${userMemb.username}</b>\n` +
    `Ends: <b>${userMemb.ends}</b>\nLessons <b>${userMemb.lessonsAvaliable}</b>`
}

export function generateKeyboard(): Markup.Markup<ReplyKeyboardMarkup> {
  return Markup.keyboard([
    [Command.timetable, Command.profile],
    [Command.leaderboard,Command.contact], 
  ]).resize()
}

export function profileText(userMembership: UserMembership): string {
  let res = `Your emoji:\n${userMembership.emoji+userMembership.emoji+userMembership.emoji}\n\nMembership ends:\n`

  if (userMembership.type === null)
    res += 'Sweetie🍪, you don\'t have one'
  else {
    res += `<b>${userMembership.ends}</b>\n\n`

    if (userMembership.type === noLimit)
      res += '<b>You</b> are <b>my</b> favourite student🤍'
    else
      res += `Lessons remainings:\n <b>${userMembership.lessonsAvaliable}</b>`
  }

  return res
}

const medals = ['🥇','🥈','🥉']
function medalEmoji(i: number): string {
  if (i < medals.length) return medals[i]
  return '🎖'
}

export function leaderboardText(users: UserWithCount[]): string {
  let text = 'The Yoggiest Yogi of the month📅:\n\n'
  let medalI = 0

  for (let i = 0; i < users.length; i++) {
    if (i > 0 && users[i].mycount < users[i - 1].mycount) medalI++

    text += `${medalEmoji(medalI)} ${userName(users[i])} ${users[i].emoji} (${users[i].mycount} times)\n`
  }

  return text
}

export function profileBtns() {
  return Markup.inlineKeyboard([
    [Markup.button.callback('Change emoji', Command.changeEmoji)],
    [Markup.button.callback('Activate membership', Command.activateMembership)],
  ])
}

export function isSingleEmoji(str: string) {
  const matches = str.match(emojiRegex());

  return matches && matches.length === 1;
}

export function validUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/;

  return uuidRegex.test(uuid)
}

export function userName(user: Pick<User, 'name' | 'username'>) {
  let name = ''

  if (user.username) name += '@' + user.username
  else name += user.name

  return name
}
