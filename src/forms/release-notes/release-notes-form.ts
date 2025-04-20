import { merge, debounceTime } from 'rxjs'
import {
  watchControl,
  clearFormErrors,
  validateForm,
} from '../../utils/form-control-utils'
import { required } from '../../utils/form-validations'
import { IReleaseNotesForm } from './i-release-notes'
import { getPrInfo } from '../../api/get-pr-info'
import { AxiosError, AxiosResponse } from 'axios'
import { generateReleaseNotes } from '../../utils/generate-release-notes'
import flatpickr from 'flatpickr'
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

    const {
      title,
      organisation,
      project,
      repository,
      searchCriteria,
      username,
      pat,
    } = releaseNotesFormControl

    //TODO: move everything below to service
    try {
      const response: AxiosResponse = await getPrInfo(
        organisation.value ?? '',
        project.value ?? '',
        repository.value ?? '',
        searchCriteria.value ?? '',
        username.value ?? '',
        pat.value ?? '',
        this.dateRange[0],
        this.dateRange[1]
      )

      generateReleaseNotes(title.value ?? '', response.data.value)
      showToast('Release notes generated successfully!', ToastType.SUCCESS)
    } catch (error: unknown) {
      const typedError: AxiosError = error as AxiosError
      showToast(typedError.message, ToastType.ERROR)
      return
    }
    hideSpinner()
  }

  // filterPrInfoByDateRange(
  //   dateRange: Date[],
  //   pullRequests: IPullRequest[]
  // ): IPullRequest[] {
  //   const [start, end] = dateRange

  //   if (!start || !end) {
  //     return pullRequests
  //   }

  //   const normalizedStart = startOfDay(start)
  //   const normalizedEnd = startOfDay(end)

  //   return pullRequests.filter((pr: IPullRequest) => {
  //     const prCloseDate = startOfDay(new Date(pr.closedDate)) // Normalize PR close date
  //     return isWithinInterval(prCloseDate, {
  //       start: normalizedStart,
  //       end: normalizedEnd,
  //     })
  //   })
  // }
}
