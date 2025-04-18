import { IFormControl } from '../core/i-form-core'

export interface ISettingsForm {
  changeTypes: IChangeType
}

export interface IChangeType {
  feature: IFormControl<string[]>
  bugfix: IFormControl<string[]>
  breakingChange: IFormControl<string[]>
  improvement: IFormControl<string[]>
}
