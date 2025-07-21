"use client";

import { GeneratedAvatar } from "@/components/ui/generated-avatar";
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
              {row.original.message}
            </div>
          </div>
        </div>
      );
    },
  },
];
