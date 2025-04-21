import { debounceTime, merge } from 'rxjs'
import {
  clearFormErrors,
  validateForm,
  watchControl,
} from '../../utils/form-control-utils'
import { ISettingsForm } from './i-settings'
import { SETTINGS } from '../../globals/settings'

const settingsFormControl: ISettingsForm = {
  changeTypes: {
    feature: { value: ['feat', 'feature'], validations: [] },
    bugfix: { value: ['bugfix'], validations: [] },
    breakingChange: { value: ['breaking-change'], validations: [] },
    improvement: { value: ['improvement'], validations: [] },
  },
}

export class SettingsForm {
  values = settingsFormControl.changeTypes

  settingsForm: HTMLFormElement
  constructor() {
    this.settingsForm = document.getElementById(
      'settingsForm'
    ) as HTMLFormElement

    this.setupInputListeners()
    this.setupFormSubmitListener()
  }

  setupInputListeners() {
    const [titleHooksControl$] = watchControl(
      'titleHooksControl',
      SETTINGS.CATEGORISE_PULL_REQUESTS ? 'true' : ''
    )
    titleHooksControl$.subscribe((event: Event) => {
      const titleHooksComponent = document.getElementById(
        'titleHooks'
      ) as HTMLDivElement
      const shouldShow = (event.target as HTMLInputElement).checked
      SETTINGS.CATEGORISE_PULL_REQUESTS = shouldShow
      titleHooksComponent.style.display = shouldShow ? 'flex' : 'none'
    })

    const [feature$] = watchControl('feature', 'feat,feature')
    const [bugfix$] = watchControl('bugfix', 'bugfix')
    const [breakingChange$] = watchControl('breakingChange', 'breaking-change')
    const [improvement$] = watchControl('improvement', 'improvement')

    merge(feature$, bugfix$, breakingChange$, improvement$)
      .pipe(debounceTime(200))
      .subscribe((event: Event) => {
        const target = event.target as HTMLInputElement | HTMLSelectElement
        settingsFormControl.changeTypes[
          target.id as keyof ISettingsForm['changeTypes']
        ].value = target.value.split(',')
        clearFormErrors(settingsFormControl)
      })

    document.getElementById('settings')?.addEventListener('click', () => {
      this.settingsForm?.toggleAttribute('open')
    })
  }

  setupFormSubmitListener() {
    this.settingsForm?.addEventListener('submit', (event: Event) => {
      event.preventDefault()
      const formIsValid = validateForm<ISettingsForm>(settingsFormControl)
      if (!formIsValid) return
      this.onValidFormSubmitted()
    })
  }

  async onValidFormSubmitted() {
    const { feature, bugfix, breakingChange, improvement } =
      settingsFormControl.changeTypes
    const changeTypes = {
      feature: feature.value,
      bugfix: bugfix.value,
      breakingChange: breakingChange.value,
      improvement: improvement.value,
    }
    console.log('changeTypes', changeTypes)
  }
}
