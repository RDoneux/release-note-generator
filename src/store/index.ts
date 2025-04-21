import { configureStore } from '@reduxjs/toolkit'
import storage from 'redux-persist/lib/storage'
import { persistReducer, persistStore } from 'redux-persist'
import appSlice from './app-slice'

// Persist configuration
const persistConfig = {
  key: 'root',
  storage,
}

// Persisted reducer
const persistedReducer = persistReducer(persistConfig, appSlice.reducer)

// Configure the store
const store = configureStore({
  reducer: {
    application: persistedReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [
          'persist/PERSIST',
          'persist/REHYDRATE',
          'persist/FLUSH',
        ],
      },
    }),
})

// Export the persistor and store
export const persistor = persistStore(store)
export default store

// Export RootState and AppDispatch types
export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
