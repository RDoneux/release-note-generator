export const SETTINGS = {
  CATEGORISE_PULL_REQUESTS: false,
}

export function updateCategorisePullRequests(value: boolean) {
  SETTINGS.CATEGORISE_PULL_REQUESTS = value
  localStorage.setItem(
    'rng:categorisePullRequests',
    JSON.stringify(SETTINGS.CATEGORISE_PULL_REQUESTS)
  )
}
