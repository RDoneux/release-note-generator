import { AxiosResponse } from 'axios'
import { getPrInfo } from '../../../api/get-pr-info'
import { generateReleaseNotes } from '../../../utils/generate-release-notes'
import { IReleaseNotesForm } from '../i-release-notes'

export async function getAndProcessPullRequestInformation(
  releaseNotesFormControl: IReleaseNotesForm,
  dateRange: Date[]
) {
  const {
    title,
    organisation,
    project,
    repository,
    searchCriteria,
    username,
    pat,
  } = releaseNotesFormControl

  const response: AxiosResponse = await getPrInfo(
    organisation.value ?? '',
    project.value ?? '',
    repository.value ?? '',
    searchCriteria.value ?? '',
    username.value ?? '',
    pat.value ?? '',
    dateRange[0],
    dateRange[1]
  )
  generateReleaseNotes(title.value ?? '', response.data.value)
}
