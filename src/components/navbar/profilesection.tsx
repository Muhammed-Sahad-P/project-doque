"use client";
import React, { useState, useEffect, useRef } from "react";
import { IoIosArrowDown, IoIosArrowUp } from "react-icons/io";
import { FiSettings } from "react-icons/fi";
import { Button } from "../ui/button";
import { IoLogOutOutline } from "react-icons/io5";
import { IoIosArrowForward } from "react-icons/io";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { useUser } from "@/contexts/user-context";
import Link from "next/link";



export default function ProfileSection() {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  const { logout,userProfile } = useUser();

  const handleClickOutside = (event: MouseEvent) => {
    if (
      dropdownRef.current &&
      !dropdownRef.current.contains(event.target as Node)
    ) {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    logout();
  };


  return (
    <div className="relative">
      <div className="flex items-center space-x-2">
        <div
          className="flex items-center space-x-2 cursor-pointer"
          onClick={() => setIsOpen(!isOpen)}
        >
          <Avatar className="w-8 h-8">
            <AvatarImage src={userProfile?.image} alt="Avatar" />
            <AvatarFallback />
          </Avatar>
          <span className="font-semibold text-gray-800">
            {userProfile?.firstName}
          </span>
          {isOpen ? (
            <IoIosArrowUp className="text-gray-600 transition-transform duration-300" />
          ) : (
            <IoIosArrowDown className="text-gray-600 transition-transform duration-300" />
          )}
        </div>
      </div>

      {isOpen && (
        <div
          ref={dropdownRef}
          className="absolute right-0 mt-2 w-64 bg-white/90 rounded-lg border border-gray-200 z-10 shadow-lg backdrop-blur-md p-3"
        >
          <Link href={`/u/${userProfile?._id}/profile`} onClick={() => setIsOpen(!isOpen)}>
            <Button className="flex items-center justify-between bg-[#E5E9EC] rounded-lg w-full hover:bg-[#E5E9EC]/90 h-12 p-2">
              <div className="flex items-center space-x-2">
                <Avatar className="w-8 h-8">
                  <AvatarImage src={userProfile?.image} alt="Avatar" />
                  <AvatarFallback />
                </Avatar>
                <span className="font-semibold text-gray-800">
                  {userProfile?.firstName}
                </span>
              </div>
              <div className="flex items-center space-x-1">
                <span className="text-sm text-gray-500">Profile</span>
                <IoIosArrowForward className="text-gray-600" />
              </div>
            </Button>
          </Link>

          <div className="flex justify-between gap-2 mt-2 border-b border-gray-200 pb-2" >
            <Button className="flex-1 bg-[#C8AFBE] text-black rounded-2xl h-10 hover:bg-[#C7C3B5]" onClick={() => setIsOpen(!isOpen)}>
              Theme
            </Button>
            <Button className="flex-1 bg-[#C8AFBE] text-black rounded-2xl h-10 hover:bg-[#C7C3B5]" onClick={() => setIsOpen(!isOpen)}>
              Templates
            </Button>
          </div>

          <div className="flex justify-between gap-2 mt-2">
            <Link href="/u/1/settings" className="flex-1 bg-[#E5E9EC] text-black rounded-2xl flex items-center justify-center h-8 hover:bg-[#C7C3B5]">
              <FiSettings className="mr-1" />
              Settings
            </Link>
            <Button
              onClick={()=> {handleLogout(); setIsOpen(!isOpen)}}
              className="flex-1 bg-[#E5E9EC] text-black rounded-2xl flex items-center justify-center h-8 hover:bg-[#C7C3B5]"
            >
              <IoLogOutOutline className="mr-1" />
              Logout
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
