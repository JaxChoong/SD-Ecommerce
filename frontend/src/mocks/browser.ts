import { setupWorker } from 'msw/browser'
import { handlers } from './handlers'
import { seed } from './seed'

seed()

export const worker = setupWorker(...handlers)
