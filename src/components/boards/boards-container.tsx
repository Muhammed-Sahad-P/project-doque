"use client";

import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { useEffect, useMemo, useState } from "react";
import {
  horizontalListSortingStrategy,
  SortableContext,
} from "@dnd-kit/sortable";
import SectionContainer from "./section-container";
import { Button } from "../ui/button";
import { FaPlus } from "react-icons/fa6";
import { Column, Space, TaskRow } from "@/types/spaces";
import TaskCard from "./task-card";
import { useBoards } from "@/contexts/boards-context";
import { useParams } from "next/navigation";
import { debouncedApiMoveTask } from "@/utils/taskUtils";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import { createList, getSpace } from "@/lib/store/thunks/tasks-thunks";
import HandleLoading from "../ui/handle-loading";
import { useToast } from "@/hooks/use-toast";
import { ToastAction } from "../ui/toast";

export default function BoardsContainer({ spaceData }: { spaceData: Space }) {
  const [activeColumn, setActiveColumn] = useState<Column | null>(null);
  const [activeTask, setActiveTask] = useState<TaskRow | null>(null);
  const [movingTask, setMovingTask] = useState<boolean>(false);

  const { spaceId }: { spaceId: string } = useParams();

  const {
    setTasks,
    moveColumn,
    moveTaskToColumn,
    swapTasksInSameColumn,
    populateBoardData,
  } = useBoards();

  const { toast } = useToast();
  const dispatch = useAppDispatch();
  const { tasks, lists, loading, error } = useAppSelector(
    (state) => state.tasks
  );
  const [prevState, setPrevState] = useState<string>(JSON.stringify(lists));

  useEffect(() => {
    dispatch(getSpace(spaceId));
    populateBoardData(spaceData);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); //do not include populate function inside dependency!!

  const columnsIds = useMemo(() => lists.map((column) => column.id), [lists]);

  const handleDragStart = (event: DragStartEvent) => {
    const active = event.active.data.current; // This is the active item that is being dragged
    if (active?.type === "section") {
      setActiveColumn(active.section); // if the active item is a section, set it as the active column
      return;
    }
    if (active?.type === "task") {
      setPrevState(JSON.stringify(tasks)); // Save the previous state of the tasks to revert back incase of error
      setActiveTask(active.task); // if the active item is a task, set it as the active task
      return;
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveColumn(null);
    setActiveTask(null); // reset the active column and task
    const { active, over } = event;
    if (!over) {
      return;
    }

    const activeId = active.id;
    const overId = over.id;

    // api call for moving the task
    if (active.data.current?.type === "task") {
      const currentListId = JSON.parse(prevState).find(
        (task: TaskRow) => task.id === activeId
      )?.column;

      const newListId =
        over.data.current?.type === "section"
          ? overId
          : over.data.current?.type === "task"
          ? tasks.find((task) => task.id === overId)?.column
          : null;

      if (currentListId !== newListId) {
        debouncedApiMoveTask(
          spaceId,
          currentListId!,
          activeId.toString(),
          newListId?.toString() || "",
          setTasks,
          prevState,
          setMovingTask,
          (msg) => {
            console.log(msg);
          }
        );
      }
      return;
    }

    if (activeId === overId) return;

    moveColumn(activeId, overId); // move the column if the active item is a column
  };

  const handleDragOver = (event: DragEndEvent) => {
    // This function is called when the dragged item is over another item
    const { active, over } = event;
    if (!over) {
      return;
    }

    const activeId = active.id;
    const overId = over.id;

    if (activeId === overId) return;

    const taskIsActive = active.data.current?.type === "task";
    const isOverATask = over.data.current?.type === "task";

    if (!taskIsActive) return;

    if (taskIsActive && isOverATask) {
      // If the active item is a task and the over item is a task, swap the positions of the tasks
      setTimeout(() => {
        swapTasksInSameColumn(activeId, overId);
      }, 10); // This is to prevent the unnecessary re-rendering caused by layout shifts like scrollbar appearing
    }

    const isOverAColumn = over.data.current?.type === "section";

    if (taskIsActive && isOverAColumn) {
      // If the active item is a task and the over item is a column, move the task to the column
      setTimeout(() => {
        moveTaskToColumn(activeId, overId);
      }, 10);
    }
  };

  const mouseSensor = useSensor(MouseSensor, {
    // Require the mouse to move by 20 pixels before activating
    activationConstraint: {
      distance: 20,
    },
  });

  const touchSensor = useSensor(TouchSensor, {
    // Press delay of 250ms, with tolerance of 5px of movement
    activationConstraint: {
      delay: 100,
      tolerance: 5,
    },
  });

  const sensors = useSensors(mouseSensor, touchSensor);

  useEffect(() => {
    //? Show toast if there is an error while creating a list
    if (error.createList) {
      toast({
        title: "Couldn't create list",
        description: error.createList + "!!",
        action: (
          <ToastAction onClick={handleCreateList} altText="Try again">
            Try again
          </ToastAction>
        ),
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [error.createList]);

  const handleCreateList = () => {
    dispatch(
      createList({
        listData: { name: "New List" },
        onSuccess() {
          toast({ description: "List created" });
        },
        spaceId,
      })
    );
  };

  return (
    <DndContext
      id="dnd-context-id"
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}>
      <div className="w-full">
        <div className="flex gap-4 items-center">
          <Button
            title="Create new List"
            disabled={loading.createList || loading.getSpaceDetails}
            onClick={handleCreateList}
            size="sm"
            variant="outline"
            className="flex gap-2 items-center my-2">
            Add Column <FaPlus size={10} />
          </Button>
          <div className="text-sm text-gray-700">
            {loading.createList && <p>Creating..</p>}
            {loading.deleteList && <p>Deleting List..</p>}
            {loading.createTask && <p>Creating task..</p>}
            {loading.updateList && <p>Updating list..</p>}
            {movingTask && <p>Moving task...</p>}
          </div>
        </div>
        <HandleLoading
          loading={loading.getSpaceDetails}
          error={error.getSpaceDetails}>
          <>
            <div className="flex gap-4 w-screen-lg overflow-auto scrollbar-thin scrollbar-thumb-zinc-700 scrollbar-track-white scrollbar-corner-transparent">
              <SortableContext
                items={columnsIds}
                strategy={horizontalListSortingStrategy}>
                {lists.map((section) => (
                  <SectionContainer
                    key={section.id}
                    section={section}
                    tasks={tasks.filter((task) => task.column === section.id)}
                  />
                ))}
              </SortableContext>
            </div>
            <DragOverlay>
              {activeColumn ? (
                <SectionContainer
                  section={activeColumn}
                  tasks={tasks.filter(
                    (task) => task.column === activeColumn.id
                  )}
                />
              ) : null}
              {activeTask ? <TaskCard task={activeTask} /> : null}
            </DragOverlay>
          </>
        </HandleLoading>
      </div>
    </DndContext>
  );
}
