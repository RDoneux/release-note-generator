export const ToastType = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
} as const
export type ToastType = (typeof ToastType)[keyof typeof ToastType]

export function showToast(
  message: string,
  type: ToastType,
  duration: number = 5000
): void {
  const toastContainer = document.createElement('div')
  toastContainer.className = 'toast-container'
  document.body.appendChild(toastContainer)

  const toast = document.createElement('div')
  toast.className = 'toast'
  toast.textContent = message
  toast.classList.add(type)
  toastContainer.appendChild(toast)

  setTimeout(() => {
    toast.remove()
    if (toastContainer.children.length === 0) {
      toastContainer.remove()
    }
  }, duration)
}
