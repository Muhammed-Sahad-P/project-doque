"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CalendarIcon } from "@radix-ui/react-icons";
import { Button } from "@/components/ui/button";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import StackedAvatars from "../ui/stacked-avatars";
import { useEffect, useState } from "react";
import axiosInstance from "@/utils/axios";
import { useParams } from "next/navigation";
import { Member } from "@/types/spaces";

export default function MembersAvatars() {
  const [members, setMembers] = useState<Member[]>([]);

  const { workSpaceId } = useParams();

  useEffect(() => {
    async function fetchMembers() {
      try {
        const { data: workSpaceData } = await axiosInstance.get(
          `/workspace/${workSpaceId}`
        );
        const memberIds = workSpaceData.data.members;
        const members: Member[] = await Promise.all(
          memberIds.map(async (memberId: string) => {
            const { data: memberData } = await axiosInstance.get(
              `/user/${memberId}`
            );
            return memberData;
          })
        );
        setMembers(members);
      } catch (error) {
        console.error(error);
      }
    }
    fetchMembers();
  }, [workSpaceId]);

  return (
    <div>
      <HoverCard>
        <HoverCardTrigger asChild>
          <Button variant="ghost" className="cursor-pointer">
            <StackedAvatars members={members} max={3} size="md" />
          </Button>
        </HoverCardTrigger>
        <HoverCardContent
          align="end"
          className="space-y-2 relative top-1 left-4">
          {members.map((member, i) => (
            <div key={i} className="flex gap-4">
              <Avatar>
                <AvatarImage src="https://github.com/shadcn.png" />
                <AvatarFallback>VC</AvatarFallback>
              </Avatar>
              <div>
                <h4 className="text-sm font-semibold">Name</h4>
                <div className="flex items-center">
                  <CalendarIcon className="mr-2 h-4 w-4 opacity-70" />{" "}
                  <span className="text-xs text-muted-foreground">
                    Joined December 2021
                  </span>
                </div>
              </div>
            </div>
          ))}
        </HoverCardContent>
      </HoverCard>
    </div>
  );
}
