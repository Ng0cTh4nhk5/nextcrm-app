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

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Reset password dialog state
  const [resetOpen, setResetOpen] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);

  const onCopy = (id: string) => {
    navigator.clipboard.writeText(id);
    toast.success("Đã sao chép ID.");
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
      toast.success("Đã xóa user.");
    } catch (error) {
      toast.error("Có lỗi xảy ra khi xóa user. Vui lòng thử lại.");
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
      toast.success("Đã kích hoạt user.");
    } catch (error) {
      toast.error("Có lỗi xảy ra khi kích hoạt user. Vui lòng thử lại.");
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
      toast.success("Đã vô hiệu hóa user.");
    } catch (error) {
      toast.error("Có lỗi xảy ra khi vô hiệu hóa user. Vui lòng thử lại.");
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
      toast.success(`Đã đổi quyền thành ${role}.`);
    } catch (error) {
      toast.error("Có lỗi xảy ra khi đổi quyền. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  const onResetPassword = async () => {
    if (!newPassword || newPassword.length < 8) {
      toast.error("Mật khẩu phải ít nhất 8 ký tự.");
      return;
    }
    try {
      setResetLoading(true);
      const result = await resetUserPassword(data.id, newPassword);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success("Đã đặt lại mật khẩu thành công.");
      setResetOpen(false);
      setNewPassword("");
    } catch (error) {
      toast.error("Có lỗi xảy ra khi đặt lại mật khẩu. Vui lòng thử lại.");
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
            <DialogTitle>Đặt lại mật khẩu</DialogTitle>
          </DialogHeader>
          <div className="grid gap-3 py-2">
            <p className="text-sm text-muted-foreground">
              Đặt mật khẩu mới cho <strong>{data.name || data.email}</strong>
            </p>
            <div className="grid gap-1.5">
              <Label htmlFor="new-password">Mật khẩu mới</Label>
              <div className="relative">
                <Input
                  id="new-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Ít nhất 8 ký tự"
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
              Hủy
            </Button>
            <Button onClick={onResetPassword} disabled={resetLoading || newPassword.length < 8}>
              {resetLoading ? "Đang lưu..." : "Lưu mật khẩu"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant={"ghost"} className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuItem onClick={() => onCopy(data?.id)}>
            <Copy className="mr-2 w-4 h-4" />
            Copy ID
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => onActivate()}>
            <UserCheck className="mr-2 w-4 h-4" />
            Activate
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onDeactivate()}>
            <UserX className="mr-2 w-4 h-4" />
            Deactivate
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setResetOpen(true)}>
            <KeyRound className="mr-2 w-4 h-4" />
            Đặt lại mật khẩu
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <Shield className="mr-2 w-4 h-4" />
              Set Role
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              <DropdownMenuItem onClick={() => onSetRole("admin")}>
                Admin
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onSetRole("manager")}>
                Manager
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onSetRole("user")}>
                User
              </DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setOpen(true)}>
            <Trash className="mr-2 w-4 h-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
