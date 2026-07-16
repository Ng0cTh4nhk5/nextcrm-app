"use client";

import { Row } from "@tanstack/react-table";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { adminUserSchema } from "../table-data/schema";
import { useRouter } from "next/navigation";
import AlertModal from "@/components/modals/alert-modal";
import { useState } from "react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

import { Copy, Eye, EyeOff, KeyRound, MoreHorizontal, Shield, Trash, UserCheck, UserX } from "lucide-react";
import { deleteUser } from "@/actions/admin/users/delete-user";
import { activateUser } from "@/actions/admin/users/activate-user";
import { deactivateUser } from "@/actions/admin/users/deactivate-user";
import { setUserRole } from "@/actions/admin/users/set-role";
import { resetUserPassword } from "@/actions/admin/users/reset-password";

interface DataTableRowActionsProps<TData> {
  row: Row<TData>;
}

export function DataTableRowActions<TData>({
  row,
}: DataTableRowActionsProps<TData>) {
  const router = useRouter();
  const data = adminUserSchema.parse(row.original);
  const t = useTranslations("AdminPage.userActions");

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Reset password dialog state
  const [resetOpen, setResetOpen] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);

  const onCopy = (id: string) => {
    navigator.clipboard.writeText(id);
    toast.success(t("copyIdSuccess"));
  };

  const onDelete = async () => {
    try {
      setLoading(true);
      const result = await deleteUser(data.id);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      router.refresh();
      toast.success(t("deleteSuccess"));
    } catch (error) {
      toast.error(t("deleteError"));
    } finally {
      setLoading(false);
      setOpen(false);
    }
  };

  const onActivate = async () => {
    try {
      setLoading(true);
      const result = await activateUser(data.id);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      router.refresh();
      toast.success(t("activateSuccess"));
    } catch (error) {
      toast.error(t("activateError"));
    } finally {
      setLoading(false);
    }
  };

  const onDeactivate = async () => {
    try {
      setLoading(true);
      const result = await deactivateUser(data.id);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      router.refresh();
      toast.success(t("deactivateSuccess"));
    } catch (error) {
      toast.error(t("deactivateError"));
    } finally {
      setLoading(false);
    }
  };

  const onSetRole = async (role: "admin" | "manager" | "user") => {
    try {
      setLoading(true);
      const result = await setUserRole(data.id, role);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      router.refresh();
      toast.success(t("changeRoleSuccess", { role: t(`roles.${role}`) }));
    } catch (error) {
      toast.error(t("changeRoleError"));
    } finally {
      setLoading(false);
    }
  };

  const onResetPassword = async () => {
    if (!newPassword || newPassword.length < 8) {
      toast.error(t("passwordMinLength"));
      return;
    }
    try {
      setResetLoading(true);
      const result = await resetUserPassword(data.id, newPassword);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success(t("resetPasswordSuccess"));
      setResetOpen(false);
      setNewPassword("");
    } catch (error) {
      toast.error(t("resetPasswordError"));
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <>
      {/* Confirm delete dialog */}
      <AlertModal
        isOpen={open}
        onClose={() => setOpen(false)}
        onConfirm={onDelete}
        loading={loading}
      />

      {/* Reset password dialog */}
      <Dialog open={resetOpen} onOpenChange={(v) => { setResetOpen(v); if (!v) setNewPassword(""); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t("resetPasswordTitle")}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-3 py-2">
            <p className="text-sm text-muted-foreground">
              {t.rich("resetPasswordDescription", {
                name: data.name || data.email,
                strong: (chunks) => <strong>{chunks}</strong>
              })}
            </p>
            <div className="grid gap-1.5">
              <Label htmlFor="new-password">{t("newPasswordLabel")}</Label>
              <div className="relative">
                <Input
                  id="new-password"
                  type={showPassword ? "text" : "password"}
                  placeholder={t("passwordMinHint")}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  disabled={resetLoading}
                  className="pr-10"
                  onKeyDown={(e) => e.key === "Enter" && onResetPassword()}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setResetOpen(false)} disabled={resetLoading}>
              {t("cancel")}
            </Button>
            <Button onClick={onResetPassword} disabled={resetLoading || newPassword.length < 8}>
              {resetLoading ? t("saving") : t("savePassword")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant={"ghost"} className="h-8 w-8 p-0">
            <span className="sr-only">{t("openMenu")}</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>{t("actionsTitle")}</DropdownMenuLabel>
          <DropdownMenuItem onClick={() => onCopy(data?.id)}>
            <Copy className="mr-2 w-4 h-4" />
            {t("copyId")}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => onActivate()}>
            <UserCheck className="mr-2 w-4 h-4" />
            {t("activate")}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onDeactivate()}>
            <UserX className="mr-2 w-4 h-4" />
            {t("deactivate")}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setResetOpen(true)}>
            <KeyRound className="mr-2 w-4 h-4" />
            {t("resetPassword")}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <Shield className="mr-2 w-4 h-4" />
              {t("setRole")}
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              <DropdownMenuItem onClick={() => onSetRole("admin")}>
                {t("roles.admin")}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onSetRole("manager")}>
                {t("roles.manager")}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onSetRole("user")}>
                {t("roles.user")}
              </DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setOpen(true)}>
            <Trash className="mr-2 w-4 h-4" />
            {t("delete")}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
