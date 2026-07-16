"use client";

import moment from "moment";
import { ColumnDef } from "@tanstack/react-table";
import { useTranslations, useLocale } from "next-intl";
import { vi, enUS } from "date-fns/locale";
import { formatDistanceToNowStrict } from "date-fns";

import { statuses } from "../table-data/data";
import { AdminUser } from "../table-data/schema";
import { DataTableRowActions } from "./data-table-row-actions";
import { DataTableColumnHeader } from "./data-table-column-header";

const CreatedOnCell = ({ value }: { value: string }) => {
  return (
    <div className="w-[130px]">
      {moment(value).format("YYYY/MM/DD-HH:mm")}
    </div>
  );
};

const LastLoginCell = ({ value }: { value?: Date | string | null }) => {
  const locale = useLocale();
  const localeObj = locale === "vi" ? vi : enUS;
  return (
    <div className="min-w-[150px]">
      {formatDistanceToNowStrict(
        new Date(value || new Date()),
        {
          addSuffix: true,
          locale: localeObj,
        }
      )}
    </div>
  );
};

const NameCell = ({ value }: { value: string }) => {
  return <div className="">{value}</div>;
};

const EmailCell = ({ value }: { value: string }) => {
  return <div className="">{value}</div>;
};

const RoleCell = ({ role }: { role?: string | null }) => {
  const t = useTranslations("AdminPage.userActions.roles");
  const roleKey = (role?.toLowerCase() || "user") as "admin" | "manager" | "user";
  return <div className="">{t(roleKey)}</div>;
};

const StatusCell = ({ statusValue }: { statusValue: string }) => {
  const t = useTranslations("AdminPage.usersTable.statuses");
  const statusKey = statusValue.toLowerCase() as "active" | "inactive" | "pending";
  const status = statuses.find((s) => s.value === statusValue);
  if (!status) return null;
  return (
    <div className="flex items-center">
      {status.icon && (
        <status.icon className="mr-2 h-4 w-4 text-muted-foreground" />
      )}
      <span>{t(statusKey, { defaultValue: status.label })}</span>
    </div>
  );
};

const LanguageCell = ({ language }: { language: string }) => {
  const t = useTranslations("AdminPage.usersTable.languages");
  const langKey = language.toLowerCase() as "en" | "vi";
  return <div className="">{t(langKey, { defaultValue: language })}</div>;
};

export const columns: ColumnDef<AdminUser>[] = [
  {
    accessorKey: "created_on",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="columns.createdOn" />
    ),
    cell: ({ row }) => <CreatedOnCell value={row.getValue("created_on")} />,
    enableSorting: true,
    enableHiding: true,
  },
  {
    accessorKey: "lastLoginAt",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="columns.lastLogin" />
    ),
    cell: ({ row }) => <LastLoginCell value={row.original.lastLoginAt} />,
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="columns.name" />
    ),
    cell: ({ row }) => <NameCell value={row.getValue("name")} />,
    enableSorting: true,
    enableHiding: true,
  },
  {
    accessorKey: "email",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="columns.email" />
    ),
    cell: ({ row }) => <EmailCell value={row.getValue("email")} />,
    enableSorting: true,
    enableHiding: true,
  },
  {
    accessorKey: "role",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="columns.role" />
    ),
    cell: ({ row }) => <RoleCell role={row.original.role} />,
    enableSorting: true,
    enableHiding: true,
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
  {
    accessorKey: "userStatus",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="columns.status" />
    ),
    cell: ({ row }) => <StatusCell statusValue={row.getValue("userStatus")} />,
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
  {
    accessorKey: "userLanguage",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="columns.language" />
    ),
    cell: ({ row }) => <LanguageCell language={row.getValue("userLanguage")} />,
    enableSorting: true,
    enableHiding: true,
  },
  {
    id: "actions",
    cell: ({ row }) => <DataTableRowActions row={row} />,
  },
];
