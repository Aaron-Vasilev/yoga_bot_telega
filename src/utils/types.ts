export interface User {
  id: number
  name: string
  username?: string
}

export interface Lesson {
  id: number
  date: string
  time: string
  description: string
  registered: number[]
}
