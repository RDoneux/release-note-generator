import axios, { AxiosResponse } from 'axios'

export function getPrInfo(
  organisation: string,
  project: string,
  repository: string,
  searchCriteria: string,
  username: string,
  pat: string
): Promise<AxiosResponse> {
  const url = `https://dev.azure.com/${organisation}/${project}/_apis/git/repositories/${repository}/pullRequests?searchCriteria.status=${searchCriteria}`
  return axios.get(url, {
    headers: { Authorization: `Basic ${btoa(username + ':' + pat)}` },
  })
}
