import { watchControl } from '../../utils/form-control-utils'
import store from '../../store'
import {
  setBreakingChange,
  setBugfix,
  setCategorisePullRequests,
  setFeature,
  setImprovement,
} from '../../store/app-slice'
import { merge, debounceTime } from 'rxjs'

export class SettingsForm {
  settingsForm: HTMLFormElement
  constructor() {
    this.settingsForm = document.getElementById(
      'settingsForm'
    ) as HTMLFormElement

    this.setupInputListeners()
  }

  setupInputListeners() {
    const [titleHooksControl$, titleHooksControl] =
      watchControl('titleHooksControl')
    const titleHooksComponent = document.getElementById(
      'titleHooks'
    ) as HTMLDivElement

    titleHooksControl$.subscribe((event: Event) => {
      const shouldShow = (event.target as HTMLInputElement).checked
      store.dispatch(setCategorisePullRequests(shouldShow))
    })

    const [feature$, feature] = watchControl('feature')
    const [bugfix$, bugfix] = watchControl('bugfix')
    const [breakingChange$, breakingChange] = watchControl('breakingChange')
    const [improvement$, improvement] = watchControl('improvement')

    store.subscribe(() => {
      const settings = store.getState().application.settings
      const categorisePullRequests = settings.categorisePullRequests

      feature.value = settings.feature.join(',')
      bugfix.value = settings.bugfix.join(',')
      breakingChange.value = settings.breakingChange.join(',')
      improvement.value = settings.improvement.join(',')

      titleHooksControl.checked = categorisePullRequests
      titleHooksComponent.style.display = categorisePullRequests
        ? 'flex'
        : 'none'
    })

    merge(feature$, bugfix$, breakingChange$, improvement$)
      .pipe(debounceTime(200))
      .subscribe((event: Event) => {
        const target = event.target as HTMLInputElement | HTMLSelectElement

        switch (target.id) {
          case 'feature':
            store.dispatch(setFeature(target.value.split(',')))
            break
          case 'bugfix':
            store.dispatch(setBugfix(target.value.split(',')))
            break
          case 'breakingChange':
            store.dispatch(setBreakingChange(target.value.split(',')))
            break
          case 'improvement':
            store.dispatch(setImprovement(target.value.split(',')))
            break
          default:
            break
        }
      })

    document.getElementById('settings')?.addEventListener('click', () => {
      this.settingsForm?.toggleAttribute('open')
    })
  }
}
