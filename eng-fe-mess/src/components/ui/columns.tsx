"use client";

import { GeneratedAvatar } from "@/components/ui/generated-avatar";
import { splitWords } from "@/utils";
import { ColumnDef } from "@tanstack/react-table";

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
      return (
        <div className="flex flex-row">
          <div className="flex items-center gap-x-2">
            <GeneratedAvatar
              variant="botttsNeutral"
              seed={row.original.username}
              classname="size-6"
            />
          </div>
          <div className="flex flex-col ml-2">
            <div className="text-sm font-semibold">{row.original.username}</div>
            <div className="text-sm text-muted-foreground">
              {row.original.email}
            </div>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "friendStatus",
    header: "Status",
    cell: ({ row }) => {
      const status = row.original.friendStatus;
      const statusColors = {
        NONE: "text-gray-500",
        PENDING: "text-yellow-500",
        ACCEPTED: "text-green-500",
        REJECTED: "text-red-500",
      };

      return (
        <div
          className={`text-sm font-medium ${
            statusColors[status as keyof typeof statusColors] || "text-gray-500"
          }`}
        >
          {status}
        </div>
      );
    },
  },
  {
    accessorKey: "online",
    header: "Online",
    cell: ({ row }) => {
      return (
        <div
          className={`text-sm ${
            row.original.online ? "text-green-500" : "text-gray-400"
          }`}
        >
          {row.original.online ? "Online" : "Offline"}
        </div>
      );
    },
  },
];
