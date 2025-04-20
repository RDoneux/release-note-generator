import { Spinner, SpinnerOptions } from 'spin.js'

const opts = {
  lines: 10, // The number of lines to draw
  length: 0, // The length of each line
  width: 2, // The line thickness
  radius: 10, // The radius of the inner circle
  scale: 1.25, // Scales overall size of the spinner
  corners: 1, // Corner roundness (0..1)
  speed: 0.7, // Rounds per second
  rotate: 0, // The rotation offset
  animation: 'spinner-line-shrink', // The CSS animation name for the lines
  direction: 1, // 1: clockwise, -1: counterclockwise
  color: '#ffffff', // CSS color or array of colors
  fadeColor: 'transparent', // CSS color or array of colors
  top: '50%', // Top position relative to parent
  left: '50%', // Left position relative to parent
  shadow: '0 0 1px transparent', // Box-shadow for the lines
  zIndex: 2000000000, // The z-index (defaults to 2e9)
  className: 'spinner', // The CSS class to assign to the spinner
  position: 'absolute', // Element positioning
}

let spinner: Spinner

export function showSpinner(id: string, options: Partial<SpinnerOptions> = {}) {
  const target = document.getElementById(id) ?? undefined
  spinner = new Spinner({ ...opts, ...options }).spin(target)
}

export function hideSpinner() {
  if (spinner) {
    spinner.stop()
  }
}
