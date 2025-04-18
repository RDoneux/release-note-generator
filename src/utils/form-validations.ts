import { IFormControlValidation } from '../forms/core/i-form-core'

export const required: (message?: string) => IFormControlValidation = (
  message?: string
) => ({
  message: message ? message : 'This field is required',
  validation: (value: unknown) => !!value,
})
