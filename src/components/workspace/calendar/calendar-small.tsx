"use client";
import React, { useState, useRef, useEffect } from "react";
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  isSameMonth,
  isSameDay,
  isToday,
} from "date-fns";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/lib/store";
import { setChosenDate } from "@/lib/store/features/workspace-slice";

const months = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

type calendar = {
  className: string;
}

const CalendarSmall: React.FC<calendar> = ({ className }) => {
  const dispatch = useDispatch<AppDispatch>()
  const { chosenDate } = useSelector((state: RootState)=> state.workspace);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [isYearPickerOpen, setYearPickerOpen] = useState(false);
  const [isMonthPickerOpen, setMonthPickerOpen] = useState(false);

  const monthPickerRef = useRef<HTMLDivElement>(null);
  const yearPickerRef = useRef<HTMLDivElement>(null);

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 101 }, (_, i) => currentYear - 50 + i);

  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));

  const onMonthSelect = (monthIndex: number) => {
    const newDate = new Date(currentMonth.getFullYear(), monthIndex, 1);
    setCurrentMonth(newDate);
    setMonthPickerOpen(false);
  };

  const onYearSelect = (year: number) => {
    const newDate = new Date(year, currentMonth.getMonth(), 1);
    setCurrentMonth(newDate);
    dispatch(setChosenDate(newDate));
    setYearPickerOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        monthPickerRef.current &&
        !monthPickerRef.current.contains(event.target as Node)
      ) {
        setMonthPickerOpen(false);
      }
      if (
        yearPickerRef.current &&
        !yearPickerRef.current.contains(event.target as Node)
      ) {
        setYearPickerOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const renderHeader = () => (
    <div className="flex justify-between items-center w-[300px] py-5">
      <button onClick={prevMonth} className="text-gray-500 hover:text-black">
        &#x276E;
      </button>
      <div className="flex space-x-5 items-center">
        <div className="relative inline-block">
          <div
            className="cursor-pointer p-2 rounded-lg hover:bg-gray-100"
            onClick={() => setMonthPickerOpen(!isMonthPickerOpen)}
          >
            {format(currentMonth, "MMMM")}
          </div>
          {isMonthPickerOpen && (
            <div
              ref={monthPickerRef}
              className="absolute z-10 bg-white shadow-lg p-3 mt-1 rounded-lg w-40 max-h-60 overflow-y-scroll"
            >
              {months.map((month, index) => (
                <div
                  key={index}
                  className="cursor-pointer hover:bg-blue-100 p-2 rounded-lg"
                  onClick={() => onMonthSelect(index)}
                >
                  {month}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="relative inline-block">
          <div
            className="cursor-pointer p-2 rounded-lg hover:bg-gray-100"
            onClick={() => setYearPickerOpen(!isYearPickerOpen)}
          >
            {format(currentMonth, "yyyy")}
          </div>
          {isYearPickerOpen && renderYearPicker()}
        </div>
      </div>
      <button onClick={nextMonth} className="text-gray-500 hover:text-black">
        &#x276F;
      </button>
    </div>
  );

  const renderYearPicker = () => (
    <div
      ref={yearPickerRef}
      className="absolute z-10 bg-white shadow-lg p-3 mt-1 rounded-lg w-40 max-h-60 overflow-y-scroll"
    >
      {years.map((year) => (
        <div
          key={year}
          className={`cursor-pointer hover:bg-blue-100 p-2 rounded-lg flex justify-between items-center ${
            year === currentMonth.getFullYear() ? "font-bold" : ""
          }`}
          onClick={() => onYearSelect(year)}
        >
          <span>{year}</span>
          {year === currentMonth.getFullYear() && (
            <span className="text-blue-500">&#10003;</span>
          )}
        </div>
      ))}
    </div>
  );

  const renderDays = () => {
    const days = [];
    const dateFormat = "EEE";
    const startDate = startOfWeek(currentMonth);

    for (let i = 0; i < 7; i++) {
      days.push(
        <div key={i} className="text-center text-gray-500 text-xs">
          {format(addDays(startDate, i), dateFormat)}
        </div>
      );
    }

    return <div className="grid grid-cols-7 mb-2">{days}</div>;
  };

  const renderCells = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const rows = [];
    let days = [];
    let day = startDate;
    let formattedDate = "";

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        formattedDate = format(day, "d");
        const cloneDay = day;
        days.push(
          <div
            key={day.toString()}
            className={`py-1 text-center cursor-pointer ${
              !isSameMonth(day, monthStart)
                ? "text-gray-300"
                : isSameDay(day, chosenDate)
                ? "bg-black text-white rounded-full"
                : isToday(day)
                ? "bg-blue-500 text-white rounded-full"
                : "text-gray-700 hover:bg-gray-200 rounded-full"
            }`}
            onClick={() => dispatch(setChosenDate(cloneDay))}
          >
            <span>{formattedDate}</span>
          </div>
        );
        day = addDays(day, 1);
      }
      rows.push(
        <div key={day.toString()} className="grid grid-cols-7 gap-1">
          {days}
        </div>
      );
      days = [];
    }
    return <div>{rows}</div>;
  };

  return (
    <div className={`${className} p-5 bg-white rounded-lg`}>
      {renderHeader()}
      {renderDays()}
      {renderCells()}
    </div>
  );
};

export default CalendarSmall;
