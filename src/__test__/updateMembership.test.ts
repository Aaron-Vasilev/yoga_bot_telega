import { updateMembership } from '../utils'
import { Membership, Token } from '../utils/types'

const token2: Token = {
  id: '',
  type: 2,
  created: '2023-07-15',
  valid: true
}

describe(updateMembership.name, () => {
  test('Type 1 ends expired', () => {
    const membership: Membership = {
      type: 0,
      userId: 1,
      starts: '2023-01-01',
      ends: '2023-02-01',
      lessonsAvaliable: 0
    }
    const token: Token = {
      id: '',
      type: 1,
      created: '2023-07-13',
      valid: true
    }


    updateMembership(membership, token)

    expect(membership).toEqual({
      type: token.type,
      userId: membership.userId,
      starts: token.created,
      ends: '2023-08-09',
      lessonsAvaliable: 4
    })
  }) 

  test('Type 1, membership is valid', () => {
    const membership: Membership = {
      type: 0,
      userId: 1,
      starts: '2023-05-12',
      ends: '2023-07-22',
      lessonsAvaliable: 2
    }
    const token: Token = {
      id: '',
      type: 1,
      created: '2023-07-13',
      valid: true
    }

    updateMembership(membership, token)

    expect(membership).toEqual({
      type: token.type,
      userId: membership.userId,
      starts: membership.starts,
      ends: '2023-08-19',
      lessonsAvaliable: 6
    })
  }) 

  test('Type 1, membership expired, some lessons remaining', () => {
    const membership: Membership = {
      type: 1,
      userId: 1,
      starts: '2023-07-00',
      ends: '2023-07-29',
      lessonsAvaliable: 2
    }
    const token: Token = {
      id: '',
      type: 1,
      created: '2023-08-01',
      valid: true
    }
    updateMembership(membership, token)

    expect(membership).toEqual({
      type: token.type,
      userId: membership.userId,
      starts: token.created,
      ends: '2023-08-28',
      lessonsAvaliable: 4
    })
  }) 

  test('Type 2 ends expired', () => {
    const membership: Membership = {
      type: 0,
      userId: 1,
      starts: '2023-01-01',
      ends: '2023-02-01',
      lessonsAvaliable: -1
    }
    updateMembership(membership, token2)

    expect(membership).toEqual({
      type: token2.type,
      userId: membership.userId,
      starts: token2.created,
      ends: '2023-08-11',
      lessonsAvaliable: 8
    })
  })

  test('Type 2 ends is valid', () => {
    const membership: Membership = {
      type: 2,
      userId: 1,
      starts: '2023-01-01',
      ends: '2023-07-30',
      lessonsAvaliable: 5
    }
    updateMembership(membership, token2)

    expect(membership).toEqual({
      type: token2.type,
      userId: membership.userId,
      starts: membership.starts,
      ends: '2023-08-27',
      lessonsAvaliable: 13
    })
  })

  test('Type 8 ends expired', () => {
    const membership: Membership = {
      type: 2,
      userId: 1,
      starts: '2023-01-01',
      ends: '2023-02-01',
      lessonsAvaliable: 0
    }
    const token: Token = {
      id: '',
      type: 8,
      created: '2023-07-01',
      valid: true
    }

    updateMembership(membership, token)

    expect(membership).toEqual({
      type: token.type,
      userId: membership.userId,
      starts: token.created,
      ends: '2023-07-28',
      lessonsAvaliable: 0
    })
  })

  test('Type 8 ends valid', () => {
    const membership: Membership = {
      type: 8,
      userId: 1,
      starts: '2023-01-01',
      ends: '2023-07-16',
      lessonsAvaliable: 0
    }
    const token: Token = {
      id: '',
      type: 8,
      created: '2023-07-14',
      valid: true
    }

    updateMembership(membership, token)

    expect(membership).toEqual({
      type: token.type,
      userId: membership.userId,
      starts: membership.starts,
      ends: '2023-08-13',
      lessonsAvaliable: 0
    })
  })
})
