import { beforeAll, vi } from 'vitest'
import { Text, View } from 'react-native'

// Mock de base pour React Native
vi.mock('react-native', async () => {
  const actual = await vi.importActual('react-native')
  return {
    ...actual,
    StyleSheet: {
      create: (styles: any) => styles
    },
    Text,
    View
  }
})

// Mock des hooks Expo
vi.mock('expo-router', () => ({
  useRouter: () => ({
    push: vi.fn(),
    back: vi.fn()
  })
}))

// Mock de React Query
vi.mock('@tanstack/react-query', () => ({
  useQueryClient: () => ({
    invalidateQueries: vi.fn()
  }),
  useQuery: () => ({
    data: null,
    isLoading: false,
    isError: false
  }),
  useMutation: () => ({
    mutate: vi.fn()
  })
}))
