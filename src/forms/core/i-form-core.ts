export interface IFormControlValidation {
  message: string
  validation: (value: unknown) => boolean
}

export interface IFormControl<T> {
  value?: T
  error?: string
  hasError?: boolean
  validations?: IFormControlValidation[]
}
