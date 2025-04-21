import { fromEvent, Observable } from 'rxjs'
import { IFormControl } from '../forms/core/i-form-core'

export function watchControl(
  controlId: string,
  initValue: string = ''
): [Observable<Event>, HTMLInputElement] {
  const control: HTMLInputElement | null = document.getElementById(
    controlId
  ) as HTMLInputElement
  if (!control) console.warn(`Control with ID ${controlId} not found`)
  if (initValue.length) {
    control.value = initValue
    control.checked = true
  } else {
    control.checked = false
  }
  setTimeout(() => control.dispatchEvent(new Event('input')))
  return [fromEvent(control, 'input'), control]
}

export function validateForm<T extends object>(form: T): boolean {
  const values = Object.values(form)
  values.forEach((value: unknown) => {
    const controlValue: IFormControl<unknown> = value as IFormControl<unknown>

    controlValue.validations?.some((validation) => {
      const isValid = validation.validation(controlValue.value)
      console.log(isValid)
      return isValid
        ? ((controlValue.error = undefined), false)
        : ((controlValue.error = validation.message), true)
    })
  })

  Object.entries(form).forEach(([key, value]) => {
    const errorText = (value as IFormControl<unknown>).error
    if (errorText) {
      const control: HTMLElement = document.getElementById(key) as HTMLElement
      control.setAttribute('error', '')
      control.setAttribute('error-text', errorText || '')
    }
  })

  return !values.some(
    (control: IFormControl<unknown>) => control.error != undefined
  )
}

export function clearFormErrors<T extends object>(form: T) {
  Object.entries(form).forEach(([key, value]) => {
    value.error = undefined
    const control: HTMLElement = document.getElementById(key) as HTMLElement
    control.removeAttribute('error')
    control.removeAttribute('error-text')
  })
}

export function initControlWithValue(
  value: string,
  control: HTMLElement,
  sequence: number
) {
  setTimeout(() => {
    const input: HTMLInputElement = control as HTMLInputElement
    input.value = value
    input.dispatchEvent(new Event('input'))
    input.dispatchEvent(new Event('change'))
    input.dispatchEvent(new Event('blur'))
  }, sequence * 500)
}
