const KEY = 'rng:'

export function save(key: string, value: unknown) {
  localStorage.setItem(KEY + key, JSON.stringify(value))
}

export function load(key: string) {
  const value = localStorage.getItem(KEY + key)
  if (value) {
    return JSON.parse(value)
  }
  return null
}
