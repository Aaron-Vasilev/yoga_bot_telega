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
}

export interface LessonWithUsers extends Lesson{
  lessonId: number
  registered: User[]
}
