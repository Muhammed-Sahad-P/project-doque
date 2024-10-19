import { configureStore } from "@reduxjs/toolkit";
import spaceSlice from "./features/space-slice";
import tasksSlice from "./features/tasks-slice";
import workspaceReducer from "@/lib/store/features/workspace-slice";
import messageReducer from "@/lib/store/features/message-slice";

export const makeStore = () => {
  return configureStore({
    reducer: {
      space: spaceSlice,
      tasks: tasksSlice,
      workspace: workspaceReducer,
      message: messageReducer,
    },
  });
};

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];
