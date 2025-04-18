import { debounceTime, merge } from 'rxjs'
import {
  clearFormErrors,
  validateForm,
  watchControl,
} from '../../utils/form-control-utils'
import { ISettingsForm } from './i-settings'

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

  feature$ = watchControl('feature', this.values.feature.value?.join(', '))
  bugfix$ = watchControl('bugfix', this.values.bugfix.value?.join(', '))
  breakingChange$ = watchControl(
    'breakingChange',
    this.values.breakingChange.value?.join(', ')
  )
  improvement$ = watchControl(
    'improvement',
    this.values.improvement.value?.join(', ')
  )

  settingsForm: HTMLFormElement
  constructor() {
    this.settingsForm = document.getElementById(
      'settingsForm'
    ) as HTMLFormElement

    this.setupInputListeners()
    this.setupFormSubmitListener()
  }

  setupInputListeners() {
    merge(this.feature$, this.bugfix$, this.breakingChange$, this.improvement$)
      .pipe(debounceTime(200))
      .subscribe((event: Event) => {
        const target = event.target as HTMLInputElement | HTMLSelectElement
        settingsFormControl.changeTypes[
          target.id as keyof ISettingsForm['changeTypes']
        ].value = target.value.split(',')
        clearFormErrors(settingsFormControl)
      })

    document.getElementById('settings')?.addEventListener('click', () => {
      console.log('clicked')
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
