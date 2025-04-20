import axios, { AxiosResponse } from 'axios'

export function getPrInfo(
  organisation: string,
  project: string,
  repository: string,
  searchCriteria: string,
  username: string,
  pat: string,
  minTime: Date,
  maxTime: Date
): Promise<AxiosResponse> {
  const url = `https://dev.azure.com/${organisation}/${project}/_apis/git/repositories/${repository}/pullRequests?searchCriteria.status=${searchCriteria}&$top=1000&api-version=7.1&searchCriteria.minTime=${minTime.toISOString()}&searchCriteria.maxTime=${maxTime.toISOString()}`
  return axios.get(url, {
    headers: { Authorization: `Basic ${btoa(username + ':' + pat)}` },
  })
}
