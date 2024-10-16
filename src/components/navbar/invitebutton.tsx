"use client";
import React, {  useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import axios from "axios";
import { useUser } from "@/contexts/user-context";
import { useWorkSpaceContext } from "@/contexts/workspace-context";

type UserEmail = {
  email: string;
};

export default function InviteButton() {
  const { loggedUser } = useUser();
  const { workSpaceId } = useWorkSpaceContext();
  const [formData, setFormData] = useState({
    email: "",
  });
  const [suggestions, setSuggestions] = useState<UserEmail[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const handleInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value,
    }));

    if (value.length > 2) {
      try {
        const { data } = await axios.get(
          `https://daily-grid-rest-api.onrender.com/api/userprofile`,
          {
            headers: {
              Authorization: `Bearer ${loggedUser?.token}`,
            },
          }
        );
        const filteredSuggestions = data.data.filter((user: UserEmail) =>
            user.email.toLowerCase().includes(value.toLowerCase())
          );
  
          setSuggestions(filteredSuggestions);
          setShowSuggestions(true);
        setShowSuggestions(true);
      } catch (error) {
        console.log("Error fetching suggestions", error);
      }
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleSelectSuggestion = (email: string) => {
    setFormData({ email });
    setShowSuggestions(false);
  };

  const handleSend = async () => {
    try {
      await axios.post(
        `https://daily-grid-rest-api.onrender.com/api/workspace/${workSpaceId}/invite`,
        { email: formData.email },
        {
          headers: {
            Authorization: `Bearer ${loggedUser?.token}`,
          },
        }
      );
    } catch (error) {
      console.log(error);
    }
  };



  if (!workSpaceId) return null;
  else {
    return (
      <div>
        <Dialog>
          <DialogTrigger asChild>
            <Button
              variant="ghost"
              className="bg-white rounded-3xl hover:bg-transparent"
            >
              Invite
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[525px]">
            <DialogHeader>
              <DialogTitle>Invite a Member</DialogTitle>
              <DialogDescription>Add the member email</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4 relative">
                <Label htmlFor="email" className="text-right">
                  Email
                </Label>
                <div className="col-span-3 relative">
                  <Input
                    name="email"
                    id="email"
                    className="w-full"
                    autoComplete="off"
                    value={formData.email}
                    onChange={(e) => handleInputChange(e)}
                  />
                  {showSuggestions && suggestions.length > 0 && (
                    <ul className="absolute left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 max-h-40 overflow-auto">
                      {suggestions.map((suggestion, index) => (
                        <li
                          key={index}
                          className="p-2 hover:bg-gray-100 cursor-pointer"
                          onClick={() => handleSelectSuggestion(suggestion?.email)}
                        >
                          {suggestion?.email}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleSend} type="submit">
                Send
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    );
  }
}
