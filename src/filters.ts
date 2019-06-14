import { LogEntry } from './defs'

export const levelFilter = (entry: LogEntry, level?: number) => {
  if (level === undefined || level === null) {
    return true
  }
  return entry.level >= level
}

export const categoryFilter = (entry: LogEntry, category?: string) => {
  if (!category) {
    return true
  }
  if (!entry.category) {
    return false
  }
  const target = entry.category.toLowerCase()
  const categories = category.split(',').map(c => c.toLowerCase())
  const includeCategories = categories.filter(c => !c.startsWith('!'))
  const negatedCategories = categories
    .filter(c => c.startsWith('!'))
    .map(c => c.slice(1, c.length))
  if (negatedCategories.includes(target)) {
    return false
  }
  if (includeCategories.length === 0) {
    return true
  }
  return includeCategories.includes(target)
}
