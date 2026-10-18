import { seedFor } from './mockData'

const STORAGE_PREFIX = 'secureRegent_v2_'

export function loadData(key, initialData) {
  const fallback = seedFor(key) ?? initialData

  try {
    const savedData = localStorage.getItem(STORAGE_PREFIX + key)

    if (savedData !== null) {
      return JSON.parse(savedData)
    }

    localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(fallback))
    return fallback
  } catch (error) {
    console.error('Unable to load saved data:', error)
    return fallback
  }
}

export function saveData(key, data) {
  try {
    localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(data))
    return true
  } catch (error) {
    console.error('Unable to save data:', error)
    return false
  }
}

export function clearData(key) {
  localStorage.removeItem(STORAGE_PREFIX + key)
}