import { merge, debounceTime } from 'rxjs'
import {
  watchControl,
  clearFormErrors,
  validateForm,
} from '../../utils/form-control-utils'
import { required } from '../../utils/form-validations'
import { IReleaseNotesForm } from './i-release-notes'
import { AxiosError } from 'axios'
import flatpickr from 'flatpickr'
import { showToast, ToastType } from '../../utils/toast'
import { hideSpinner, showSpinner } from '../../utils/spinner'
import { getAndProcessPullRequestInformation } from '../services/release-note-form-service'

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

    try {
      getAndProcessPullRequestInformation(
        releaseNotesFormControl,
        this.dateRange
      )
      showToast('Release notes generated successfully!', ToastType.SUCCESS)
    } catch (error: unknown) {
      const typedError: AxiosError = error as AxiosError
      showToast(typedError.message, ToastType.ERROR)
      return
    }
    hideSpinner()
  }
}
