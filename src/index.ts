import '@material/web/textfield/outlined-text-field.js'
import '@material/web/select/outlined-select.js'
import '@material/web/select/select-option.js'
import '@material/web/button/filled-tonal-button.js'
import '@material/web/icon/icon.js'

// lazy load settings deps
import('@material/web/checkbox/checkbox.js')
import('@material/web/dialog/dialog.js')

import { ReleaseNotesForm } from './forms/release-notes/release-notes-form'
import { SettingsForm } from './forms/settings/settings-form'
import { persistor } from './store'

// persistor.persist()
persistor.flush().then(() => {
  new ReleaseNotesForm()
  new SettingsForm()
})
