"use client"

import React, { useEffect } from "react";
import Spinner from "../ui/spinner/spinner";
import axiosInstance from "@/utils/axios";
import { useRouter, useSearchParams } from "next/navigation";



export default function Acceptinvitation() {
  const router = useRouter()
  const searchParams = useSearchParams()  
  const workspaceId = searchParams.get("workspaceId")

  useEffect(() => {
    console.log(workspaceId);
    
    if (workspaceId) {
      const fetchData = async () => {
        try {
          const res = await axiosInstance.get(
            `/workspaces/${workspaceId}/accept-invitation`
          );
          console.log(res);
          if(res.status === 200){
            router.push(`/w/${workspaceId}/dashboard`)
          }

        } catch (err) {
          console.log(err);
          router.push(`/w/${workspaceId}/dashboard`)
        }
      };
      fetchData();
    }
  }, [workspaceId]);

  return (
    <div className="h-screen flex justify-center items-center">
      <Spinner />
    </div>
  );
}
