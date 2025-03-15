import { shuffle } from 'lodash-es'
import { suggestions } from '~~/server/utils/charts/suggestions'

export default defineEventHandler(() => {
  return shuffle(suggestions).slice(0, 5)
})
