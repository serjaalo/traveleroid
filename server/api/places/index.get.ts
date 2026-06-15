import { aggregatePlaces } from '../../utils/places'

export default defineEventHandler(async () => {
  return aggregatePlaces()
})
