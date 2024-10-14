"use client";

import React, { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Usercards from "@/components/user-profile/user-cards";
import axios from "axios";

const token =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY3MDc3OWExNDQ0MGIwYmE1NzZmNDEzNyIsImlhdCI6MTcyODU0MzM1MywiZXhwIjoxNzMxMTM1MzUzfQ.et4X9HazmsOZ7N4X20V4wlpOM26ubCthEFVJGLvPrGs";

  type UserProfile = {
    data: {
      email: string;
      firstName: string;
      lastName: string;
      image: string;
      activeWorkspace?:[];
    };
  };
  

export default function Page() {
  const [data, setData] = useState<UserProfile | null >(null);
  const [activeTab, setActiveTab] = useState<"activity" | "cards">("activity");

  const handleTabClick = (tab: "activity" | "cards") => {
    setActiveTab(tab);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const id = "670779a14440b0ba576f4137";
        const response = await axios.get(
          `https://daily-grid-rest-api.onrender.com/api/userprofile/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setData(response.data);
      } catch (err) {
        console.log(err);
      }
    };

    fetchData();
  }, []);
  

  return (
    <div className="p-8 min-h-screen bg-[#EDF1F4]">
      <div className="flex justify-around items-center p-4 rounded-lg mb-8">
        <div className="flex items-center space-x-4">
          <Avatar className="w-16 h-16">
            <AvatarImage
              src={data?.data.image}
              alt="User Profile"
            />
            <AvatarFallback />
          </Avatar>
          <div>
            <h1 className="text-xl font-bold text-gray-800">{data?.data.firstName} {data?.data.lastName}</h1>
            <h3 className="text-sm text-gray-600">{data?.data.email}</h3>
          </div>
        </div>
        <div className="text-start">
          <h2 className="text-md font-semibold text-gray-800">Bio</h2>
          <h3 className="text-sm text-gray-500">Add your description...</h3>
        </div>
        <div className="bg-lime-400 p-0.5 rounded-lg">
          <h1 className="text-sm">Online</h1>
        </div>
      </div>

      <div className="flex-col pl-20 pr-20">
        <div className="flex mb-3 gap-8 pl-10 border-b-2 border-gray-300">
          <h2
            onClick={() => handleTabClick("activity")}
            className={`text-lg font-semibold cursor-pointer ${
              activeTab === "activity"
                ? "text-black border-b-4 border-black"
                : "text-gray-500"
            }`}
          >
            Activity
          </h2>
          <h2
            onClick={() => handleTabClick("cards")}
            className={`text-lg font-semibold cursor-pointer ${
              activeTab === "cards"
                ? "text-black border-b-4 border-black"
                : "text-gray-500"
            }`}
          >
            Cards
          </h2>
        </div>

        {activeTab === "activity" ? (
          <div>
            <div className="pl-4 p-3 rounded-lg flex items-center space-x-4">
              <Avatar className="w-10 h-10">
                <AvatarImage
                  src="https://imgv3.fotor.com/images/gallery/a-man-profile-picture-with-blue-and-green-background-made-by-LinkedIn-Profile-Picture-Maker.jpg"
                  alt="User Profile"
                />
                <AvatarFallback />
              </Avatar>
              <div>
                <h1 className="text-lg font-bold text-gray-800">
                  Alixa{" "}
                  <span className="text-sm text-gray-500">- activity log</span>
                </h1>
                <p className="text-sm text-gray-600">
                  30 Sept 2024, 11:49 . Activity performed in{" "}
                  <span className="font-semibold underline">
                    Project Management
                  </span>
                </p>
              </div>
            </div>
          </div>
        ) : (
          <Usercards />
        )}
      </div>
    </div>
  );
}