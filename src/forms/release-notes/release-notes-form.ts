import { merge, debounceTime } from 'rxjs'
import {
  watchControl,
  clearFormErrors,
  validateForm,
} from '../../utils/form-control-utils'
import { required } from '../../utils/form-validations'
import { IReleaseNotesForm } from './i-release-notes'
import { getPrInfo } from '../../api/get-pr-info'
import { AxiosResponse } from 'axios'
import { generateReleaseNotes } from '../../utils/generate-release-notes'
import flatpickr from 'flatpickr'
import { IPullRequest } from '../../interfaces/i-pull-request'
import { isWithinInterval, startOfDay } from 'date-fns'

const releaseNotesFormControl: IReleaseNotesForm = {
  title: { validations: [required()] },
  organisation: { validations: [required()] },
  project: { validations: [required()] },
  repository: { validations: [required()] },
  searchCriteria: { validations: [required()] },
  username: { validations: [required()] },
  pat: { validations: [required()] },
}

export class ReleaseNotesForm {
  dateRange: Date[] = []
  releaseNotesForm: HTMLFormElement

  constructor() {
    this.releaseNotesForm = document.getElementById(
      'releaseNotesForm'
    ) as HTMLFormElement

    this.setupInputListeners()
    this.setupFormSubmitListener()

    flatpickr('#dateRange', {
      mode: 'range',
      dateFormat: 'd-m-Y',
      onChange: (selectedDates) => {
        this.dateRange = selectedDates
      },
    })
  }

  setupInputListeners() {
    const [title$] = watchControl('title')
    const [orgName$] = watchControl('organisation')
    const [projName$] = watchControl('project')
    const [repoName$] = watchControl('repository')
    const [searchCrit$] = watchControl('searchCriteria')
    const [username$] = watchControl('username')
    const [pat$] = watchControl('pat')

    merge(title$, orgName$, projName$, repoName$, searchCrit$, username$, pat$)
      .pipe(debounceTime(200))
      .subscribe((event: Event) => {
        const target = event.target as HTMLInputElement | HTMLSelectElement
        releaseNotesFormControl[target.id as keyof IReleaseNotesForm].value =
          target.value
        clearFormErrors(releaseNotesFormControl)
      })

    // initControlWithValue('Release Notes', title, 0)
    // initControlWithValue('robertdoneux', orgName, 1)
    // initControlWithValue('hr-pr-test', projName, 2)
    // initControlWithValue('hr-pr-test', repoName, 3)
    // initControlWithValue('completed', searchCrit, 4)
    // initControlWithValue('robertdoneux', username, 5)
    // initControlWithValue(
    //   '855e5st1m6hTRn40Xabvq86MZFg4vUPG3CAnaIRtzG5p5ZFPNZdSJQQJ99BDACAAAAAAAAAAAAASAZDO2D1c',
    //   pat,
    //   6
    // )
  }

  setupFormSubmitListener() {
    this.releaseNotesForm?.addEventListener('submit', (event: Event) => {
      event.preventDefault()
      const formIsValid = validateForm<IReleaseNotesForm>(
        releaseNotesFormControl
      )
      if (!formIsValid) return
      this.onValidFormSubmitted()
    })
  }

  async onValidFormSubmitted() {
    const { organisation, project, repository, searchCriteria, username, pat } =
      releaseNotesFormControl

    //TODO: move everything below to service

    const response: AxiosResponse = await getPrInfo(
      organisation.value ?? '',
      project.value ?? '',
      repository.value ?? '',
      searchCriteria.value ?? '',
      username.value ?? '',
      pat.value ?? ''
    )

    const pullRequests: IPullRequest[] = this.filterPrInfoByDateRange(
      this.dateRange,
      response.data.value
    )

    generateReleaseNotes(pullRequests)
  }

  filterPrInfoByDateRange(
    dateRange: Date[],
    pullRequests: IPullRequest[]
  ): IPullRequest[] {
    const [start, end] = dateRange

    const normalizedStart = startOfDay(start)
    const normalizedEnd = startOfDay(end)

    return pullRequests.filter((pr: IPullRequest) => {
      const prCloseDate = startOfDay(new Date(pr.closedDate)) // Normalize PR close date
      return isWithinInterval(prCloseDate, {
        start: normalizedStart,
        end: normalizedEnd,
      })
    })
  }
}
