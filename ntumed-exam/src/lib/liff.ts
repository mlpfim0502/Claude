export type LiffProfile = {
  userId: string
  displayName: string
  pictureUrl?: string
}

export const MOCK_PROFILE: LiffProfile = {
  userId: 'mock-user-001',
  displayName: 'Mock Student',
  pictureUrl: undefined,
}
