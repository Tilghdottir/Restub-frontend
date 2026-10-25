import { configureStore } from "@reduxjs/toolkit"
import { rtkApi } from "./rtk-api"

export function makeStore() {
  return configureStore({
    reducer: {
      [rtkApi.reducerPath]: rtkApi.reducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(rtkApi.middleware),
  })
}

export type AppStore = ReturnType<typeof makeStore>
export type RootState = ReturnType<AppStore["getState"]>
export type AppDispatch = AppStore["dispatch"]
