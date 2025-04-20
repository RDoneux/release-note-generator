import { merge, debounceTime } from 'rxjs'
import {
  watchControl,
  clearFormErrors,
  validateForm,
  initControlWithValue,
} from '../../utils/form-control-utils'
import { required } from '../../utils/form-validations'
import { IReleaseNotesForm } from './i-release-notes'
import { getPrInfo } from '../../api/get-pr-info'
import { AxiosError, AxiosResponse } from 'axios'
import { generateReleaseNotes } from '../../utils/generate-release-notes'
import flatpickr from 'flatpickr'
import { IPullRequest } from '../../interfaces/i-pull-request'
import { isWithinInterval, startOfDay } from 'date-fns'
import { showToast, ToastType } from '../../utils/toast'
import { hideSpinner, showSpinner } from '../../utils/spinner'

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
    const [title$, title] = watchControl('title')
    const [orgName$, orgName] = watchControl('organisation')
    const [projName$, projName] = watchControl('project')
    const [repoName$, repoName] = watchControl('repository')
    const [searchCrit$, searchCrit] = watchControl('searchCriteria')
    const [username$, username] = watchControl('username')
    const [pat$, pat] = watchControl('pat')

    merge(title$, orgName$, projName$, repoName$, searchCrit$, username$, pat$)
      .pipe(debounceTime(200))
      .subscribe((event: Event) => {
        const target = event.target as HTMLInputElement | HTMLSelectElement
        releaseNotesFormControl[target.id as keyof IReleaseNotesForm].value =
          target.value
        clearFormErrors(releaseNotesFormControl)
      })

    initControlWithValue('Release Notes', title, 0)
    initControlWithValue('Hawkrose', orgName, 0)
    initControlWithValue('4b069ba2-7d68-4c6a-a141-c1a38eb1ddf9', projName, 1)
    initControlWithValue('haop-airport-optimisation-be', repoName, 2)
    initControlWithValue('completed', searchCrit, 3)
    initControlWithValue('robdoneux@hawkrose.com', username, 4)
    initControlWithValue(
      '1XapT59j5QYY3swKUVwGp3y8IL9KTBlqe6NtQHXSEzV38P6iD2g2JQQJ99BDACAAAAAjYQIYAAASAZDO1j4l',
      pat,
      5
    )
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
    showSpinner('generateReleaseNotesButton', { top: '70px' })

    const { organisation, project, repository, searchCriteria, username, pat } =
      releaseNotesFormControl

    //TODO: move everything below to service
    try {
      const response: AxiosResponse = await getPrInfo(
        organisation.value ?? '',
        project.value ?? '',
        repository.value ?? '',
        searchCriteria.value ?? '',
        username.value ?? '',
        pat.value ?? '',
        this.dateRange[0] ?? new Date(),
        this.dateRange[1] ?? new Date()
      )

      const pullRequests: IPullRequest[] = this.filterPrInfoByDateRange(
        this.dateRange,
        response.data.value
      )

      generateReleaseNotes(pullRequests)
      showToast('Release notes generated successfully!', ToastType.SUCCESS)
    } catch (error: unknown) {
      const typedError: AxiosError = error as AxiosError
      showToast(typedError.message, ToastType.ERROR)
      return
    }
    hideSpinner()
  }

  filterPrInfoByDateRange(
    dateRange: Date[],
    pullRequests: IPullRequest[]
  ): IPullRequest[] {
    const [start, end] = dateRange

    if (!start || !end) {
      return pullRequests
    }

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
