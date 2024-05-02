import { MembershipType } from "./const"

export interface User {
  id: number
  name: string
  username?: string
  emoji: string
}

export interface Lesson {
  id: number
  date: string
  time: string
  description: string
  max: number
}

export interface LessonWithUsers extends Lesson{
  lessonId: number
  registered: User[]
}

export interface Membership {
  userId: number
  starts: string
  ends: string
  type: MembershipType
  lessonsAvaliable: number
}

export type UserMembership = User & Partial<Membership> 

export interface Token {
  id: string
  type: number
  created: string,
  valid: boolean
}

export type UserWithCount = Pick<User, 'emoji' | 'name' | 'username'> & {
  mycount: number
}

