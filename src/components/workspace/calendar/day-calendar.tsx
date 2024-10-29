"use client";

import { useParams, useSearchParams } from "next/navigation";
import moment from "moment";
import { PlusIcon } from "lucide-react";
import { useAppSelector } from "@/lib/store/hooks";
import LoadingBox from "@/components/boards/loading-box";
import clsx from "clsx";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import CreateTask from "./create-task";

type TimeSlot = { hour: number; display: string };

const generateTimeSlots = (): TimeSlot[] => {
  const times: TimeSlot[] = [];
  for (let hour = 6; hour < 24; hour++) {
    const timeString = `${hour % 12 === 0 ? 12 : hour % 12}:00 ${
      hour < 12 ? "AM" : "PM"
    }`;
    times.push({ hour, display: timeString });
  }
  for (let hour = 0; hour < 6; hour++) {
    const timeString = `${hour === 0 ? 12 : hour}:00 AM`;
    times.push({ hour, display: timeString });
  }
  return times;
};

const DayCalendar = () => {
  const { workSpaceId } = useParams();
  const searchParams = useSearchParams();
  const { allTasks, error, loading } = useAppSelector(
    (state) => state.calendar
  );

  const chosenDateParam = searchParams.get("date");
  const chosenDate = chosenDateParam
    ? moment(chosenDateParam, "MM-DD").toDate()
    : new Date();

  const times: TimeSlot[] = generateTimeSlots();

  // Filter tasks based on the chosen date
  const filteredTasks = allTasks.filter((task) => {
    if (!task.dueDate) return false;
    return moment(task.dueDate).isSame(chosenDate, "day");
  });

  // Group tasks by their time slots
  const tasksByTimeSlot: {
    [key: string]: {
      _id: string;
      priority: string;
      title: string;
      listId: string;
      spaceId: string;
    }[];
  } = {};

  filteredTasks.forEach((task) => {
    const taskTime = moment(task.dueDate).format("h");
    if (!tasksByTimeSlot[taskTime]) {
      tasksByTimeSlot[taskTime] = [];
    }
    tasksByTimeSlot[taskTime].push(task);
  });

  return (
    <div className="w-full h-full  bg-white p-4 dark:bg-darkBg">
      <div className="flex justify-between">
        <h2 className="text-lg">
          {moment(chosenDate).format("DD MMMM YYYY, dddd")}
        </h2>
        <LoadingBox loading={loading} text="Fetching data.." />
        {error && <p className="text-red-500">{error}</p>}
      </div>
      {filteredTasks.length ? (
        <p className="text-gray-500">
          {filteredTasks.length} {`task${filteredTasks.length > 1 ? "s" : ""}`}
        </p>
      ) : (
        <p className="text-gray-500">No tasks found for this day</p>
      )}
      <div className="max-h-[350px] px-4 overflow-y-scroll w-full">
        {times.map((time, idx) => (
          <div
            key={idx}
            className="flex items-center justify-between w-full border-b border-gray-900 dark:border-gray-200">
            <div className="flex gap-2 w-full h-full items-center ">
              <div className="font-medium flex-shrink-0 h-full flex items-center justify-end w-24 col-span-1">
                {time.display} -
              </div>
              <div className="w-full px-2 flex flex-wrap py-2 gap-2 items-center">
                {tasksByTimeSlot[time.hour]?.map((task) => (
                  <Link
                    key={task._id}
                    href={`/w/${workSpaceId}/spaces/${task.spaceId}?task=${task._id}&list=${task.listId}`}>
                    <div
                      className={clsx(
                        "rounded-lg py-2 px-4  w-fit cursor-pointer text-gray-900 max-w-80 overflow-hidden text-ellipsis whitespace-nowrap hover:bg-opacity-90 hover:scale-105 transition-transform",
                        {
                          "bg-red-300": task?.priority === "high",
                          "bg-yellow-300": task?.priority === "medium",
                          "bg-green-300": task?.priority === "low",
                        }
                      )}>
                      <h3>{task.title}</h3>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            <CreateTask dueTime={{ chosenDate, hour: time.hour }}>
              <Button size="icon" variant="ghost">
                <PlusIcon />
              </Button>
            </CreateTask>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DayCalendar;
