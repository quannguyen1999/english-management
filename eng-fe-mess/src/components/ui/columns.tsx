"use client";

import { GeneratedAvatar } from "@/components/ui/generated-avatar";
import { splitWords } from "@/utils";
import { ColumnDef } from "@tanstack/react-table";
import Image from "next/image";

export const columns: ColumnDef<any>[] = [
  {
    accessorKey: "name",
    header: "Meeting Name",
    cell: ({ row }) => {
      return (
        <div className="flex flex-row">
          <div className="flex items-center gap-x-2">
            <GeneratedAvatar
              variant="botttsNeutral"
              seed={row.original.agent.name}
              classname="size-6"
            />
          </div>
          <div className="flex flex-col ml-2">
            <div className="text-sm font-semibold">
              {row.original.agent.name}
            </div>
            <div className="text-sm text-muted-foreground">
              {splitWords(row.original.message, 3)}
            </div>
          </div>
        </div>
      );
    },
  },
];

export const friendColumns: ColumnDef<any>[] = [
  {
    accessorKey: "username",
    header: "Username",
    cell: ({ row }) => {
      // Use GeneratedAvatar for robust fallback
      return (
        <div className="flex flex-row gap-2 items-center py-3 border-b last:border-b-0 border-gray-100 bg-white hover:bg-gray-50 transition-colors duration-150">
          <div className="flex items-center gap-x-2 relative">
            <GeneratedAvatar
              seed={row.original.username || "User"}
              variant="botttsNeutral"
              classname="w-10 h-10"
            />
            <div className="absolute -top-1 -right-1 w-2 h-2">
              {row.original.online ? (
                <div className="w-full h-full bg-green-500 rounded-full border-2 border-white"></div>
              ) : (
                <div className="w-full h-full bg-gray-200 rounded-full border-2 border-white"></div>
              )}
            </div>
          </div>
          <div className="flex flex-col ml-2">
            <div className="text-sm font-semibold">
              {splitWords(row.original.username, 13)}
            </div>
            <div className="text-sm text-muted-foreground">
              {splitWords(row.original.email, 15)}
            </div>
          </div>
        </div>
      );
    },
  }
];
