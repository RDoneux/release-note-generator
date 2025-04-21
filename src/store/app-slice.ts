import { createSlice } from '@reduxjs/toolkit'

interface AppState {
  settings: {
    categorisePullRequests: boolean
    feature: string[]
    bugfix: string[]
    breakingChange: string[]
    improvement: string[]
  }
}

const initialState: AppState = {
  settings: {
    categorisePullRequests: false,
    feature: ['feat', 'feature'],
    bugfix: ['bugfix'],
    breakingChange: ['breaking-change'],
    improvement: ['improvement'],
  },
}

// Create the slice
const appSlice = createSlice({
  name: 'application',
  initialState,
  reducers: {
    setCategorisePullRequests: (state, action) => {
      state.settings.categorisePullRequests = action.payload
    },
    setFeature: (state, action) => {
      state.settings.feature = action.payload
    },
    setBugfix: (state, action) => {
      state.settings.bugfix = action.payload
    },
    setBreakingChange: (state, action) => {
      state.settings.breakingChange = action.payload
    },
    setImprovement: (state, action) => {
      state.settings.improvement = action.payload
    },
  },
})

// Export actions and reducer
export const {
  setCategorisePullRequests,
  setFeature,
  setBugfix,
  setBreakingChange,
  setImprovement,
} = appSlice.actions
export default appSlice
