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

const releaseNotesFormControl: IReleaseNotesForm = {
  organisation: { validations: [required()] },
  project: { validations: [required()] },
  repository: { validations: [required()] },
  searchCriteria: { validations: [required()] },
  username: { validations: [required()] },
  pat: { validations: [required()] },
}

export class ReleaseNotesForm {
  orgName$ = watchControl('organisation')
  projName$ = watchControl('project')
  repoName$ = watchControl('repository')
  searchCrit$ = watchControl('searchCriteria')
  username$ = watchControl('username')
  pat$ = watchControl('pat')

  releaseNotesForm: HTMLFormElement

  constructor() {
    this.releaseNotesForm = document.getElementById(
      'releaseNotesForm'
    ) as HTMLFormElement

    this.setupInputListeners()
    this.setupFormSubmitListener()
  }

  setupInputListeners() {
    merge(
      this.orgName$,
      this.projName$,
      this.repoName$,
      this.searchCrit$,
      this.username$,
      this.pat$
    )
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
    const { organisation, project, repository, searchCriteria, username, pat } =
      releaseNotesFormControl

    const response: AxiosResponse = await getPrInfo(
      organisation.value ?? '',
      project.value ?? '',
      repository.value ?? '',
      searchCriteria.value ?? '',
      username.value ?? '',
      pat.value ?? ''
    )

    generateReleaseNotes(response.data.value)
  }
}
