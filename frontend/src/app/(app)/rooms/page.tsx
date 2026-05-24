import type { Metadata } from "next";

import { Suspense } from "react";

import { RoomExplorer } from "@/components/rooms/RoomExplorer";

import { LoadingSpinner } from "@/components/ui/LoadingState";



export const metadata: Metadata = {

  title: "Odalar",

};



export default function RoomsPage() {

  return (

    <Suspense fallback={<LoadingSpinner className="min-h-[40vh]" />}>

      <RoomExplorer />

    </Suspense>

  );

}


