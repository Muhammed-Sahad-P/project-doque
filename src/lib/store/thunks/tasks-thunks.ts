import { createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "@/utils/axios";
import { axiosErrorCatch } from "@/utils/axiosErrorCatch";
import { Column, List, TaskRow } from "@/types/spaces";

// Fetch Space and transform it into tasks and lists
export const getSpace = createAsyncThunk(
  "space/getSpace",
  async (spaceId: string, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.get(`/space/${spaceId}`);

      // Populate lists (columns)
      const cols: Column[] = data.data.lists.map((list: List) => ({
        id: list._id,
        title: list.name,
        color: list.color,
      }));

      // Extract tasks from lists and transform them
      const taskRows: TaskRow[] = data.data.lists.flatMap((list: List) =>
        list.tasks.map((task) => ({
          ...task,
          id: task._id,
          priority: task.priority,
          dueDate: task.dueDate,
          description: task.description,
          column: list._id,
        }))
      );

      return { lists: cols, tasks: taskRows };
    } catch (error) {
      const errorMsg = axiosErrorCatch(error);
      return rejectWithValue(errorMsg);
    }
  }
);

export const createList = createAsyncThunk<
  { newList: Column },
  {
    spaceId: string;
    listData: { name: string; color?: string };
    onSuccess: () => void;
  },
  { rejectValue: string }
>(
  "tasks/createList",
  async ({ spaceId, listData, onSuccess }, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.post(
        `/space/${spaceId}/lists`,
        listData
      );
      onSuccess();
      const newList = {
        id: data.data._id,
        title: listData.name,
        color: listData.color,
      };
      return { newList };
    } catch (error) {
      return rejectWithValue(axiosErrorCatch(error));
    }
  }
);

export const deleteList = createAsyncThunk(
  "tasks/deleteList",
  async (
    {
      spaceId,
      listId,
      onSuccess,
    }: { spaceId: string; listId: string; onSuccess: () => void },
    { rejectWithValue }
  ) => {
    try {
      await axiosInstance.delete(`/space/${spaceId}/lists/${listId}`);
      onSuccess();
      return { spaceId, listId };
    } catch (error) {
      return rejectWithValue(axiosErrorCatch(error));
    }
  }
);

export const updateList = createAsyncThunk(
  "tasks/updateList",
  async (
    {
      spaceId,
      listId,
      listData,
      onSuccess,
    }: {
      spaceId: string;
      listId: string;
      listData: { name?: string; color?: string };
      onSuccess: () => void;
    },
    { rejectWithValue }
  ) => {
    try {
      await axiosInstance.put(`/space/${spaceId}/lists/${listId}`, listData);
      onSuccess();
      return { listId, listData };
    } catch (error) {
      return rejectWithValue(axiosErrorCatch(error));
    }
  }
);
