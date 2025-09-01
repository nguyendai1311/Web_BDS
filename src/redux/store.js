import { combineReducers, configureStore } from "@reduxjs/toolkit";
import courseReducer from "./slices/courseSlice";
import userReducer from "./slices/userSlice";
import orderReducer from "./slices/orderSlice";
import projectReducer from "./slices/projectSlice";
import employeeReducer from "./slices/employeeSlice"; 

import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from "redux-persist";
import storage from "redux-persist/lib/storage";

const persistConfig = {
  key: "root",
  version: 1,
  storage,
  blacklist: ["product"], // nếu có slice nào không muốn persist thì thêm vào đây
};

const rootReducer = combineReducers({
  course: courseReducer,
  user: userReducer,
  order: orderReducer,
  project: projectReducer,
  employee: employeeReducer, // thêm employee slice
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

export const persistor = persistStore(store);
