export const AID = 362575139
export const VID = 833382946
export const ADMINS = [AID, VID]

export enum Command {
  contact = 'Contact 💌',
  profile = 'Profile 🧘',
  timetable = 'Timetable 🗓',
  changeEmoji = 'Change emoji',
  activateMembership = 'Activate membership',
}
export enum Message {
  botUpdated = 'Hey cookie🍪, the bot was updated, check it out!\n\n\nAuthor: @genii_v',
  contact = 'Address: <b>Haifa, Herzlia 16</b>\n\nTelephone: <b>0534257328</b> \n\nQuestions: @vialettochka\n\n<b>Prices:</b>\n 50₪ - first time\n 70₪ - visit without a pass\n<b>4 weeks passes:</b>\n 200₪ - 1 visit in a week\n 300₪ - 2 visits in a week\n 400₪ - unlimited visits',
  error = 'Oops, Something went wrong!',
  greeting = 'Hello to all my dear yoga students!\nI hope you are feeling healthy and happy.\nI look forward to practice together. See you on the mat🤍',
  seeyou = 'See you in the session✨',
  passiveAggression = 'You don\'t listen...🗿', 
  prevMembership = 'Hey puncake🥞, I won\'t be able to give classes for a couple of days. So, <b>I update the end</b> date of your membership🤝\nThis is your current membership:',
  updatedMembership = 'And this is the updated one. See you at the lesson, chocolate🍫',
  timtableUpdated = 'My dear student, the new timetable is waiting for you.\nSee you at the lesson🙏',
  sendEmoji = 'Send me a message with only <b>one emoji</b>\n\n*Unfortunately, Telegram doesn\'t support their cool emojis for bots',
  typeNotification = 'Type notification',
  unregister = 'You are free, fatass...🌚',
}
export enum Sticker {
  pinkSheepMeditating = 'CAACAgIAAxkBAAEi0oFklVEDLgLxyg23P1fyOASMuSO7SQACbgAD5KDOByc3KCA4N217LwQ',
}
export const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', '  Fri', 'Sat']
export const REGISTER = 'R'
export const UNREGISTER = 'U'

export enum InternalCmd {
  activateMembership = 'ACTIVATE_MEMBERSHIP',
  changeEmoji = 'CHANGE_EMOJI',
  newTimetable = 'NEW_TIMETABLE',
  notify = 'NOTIFY',
  notificationScenario = 'NOTIFICATION_SCENARIO',
  sendToAll = 'SEND_TO_ALL',
  signStudents = 'SIGN_STUDENTS',
  sign = 'SIGN',
}

export enum MembershipType {
  oneTime = 1,
  twoTimes = 2,
  noLimit = 8
}
