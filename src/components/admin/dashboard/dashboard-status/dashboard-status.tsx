import React from "react";

interface DashboardStatsProps {
  totalMembers: number;
  totalWorkspaces: number;
  totalSpaces: number;
}

export default function DashboardStats({
  totalMembers,
  totalWorkspaces,
  totalSpaces,
}: DashboardStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
      {[
        { title: "Total Users", value: totalMembers },
        { title: "Total Workspaces", value: totalWorkspaces },
        { title: "Total Spaces", value: totalSpaces },
      ].map((item, index) => (
        <div
          key={index}
          className="p-6 bg-white dark:bg-gray-800 shadow rounded-lg flex flex-col items-center"
        >
          <h2 className="text-3xl font-bold">{item.value}</h2>
          <p className="text-gray-600 dark:text-gray-400">{item.title}</p>
        </div>
      ))}
    </div>
  );
}