import { IFormControl } from '../core/i-form-core'

export interface IReleaseNotesForm {
  title: IFormControl<string>
  organisation: IFormControl<string>
  project: IFormControl<string>
  repository: IFormControl<string>
  searchCriteria: IFormControl<'completed'>
  username: IFormControl<string>
  pat: IFormControl<string>
}
