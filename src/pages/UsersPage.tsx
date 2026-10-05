import { useEffect, useState } from "react";
import { CanceledError, isAxiosError } from "axios";
import { Shield, ShieldCheck, Trash2, UsersRound } from "lucide-react";
import { toast } from "sonner";
import apiClient from "@/services/api-client";
import getAuthUser from "@/lib/auth";
import type { User } from "@/types/User";

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [pendingUserId, setPendingUserId] = useState<string | null>(null);
  const currentUser = getAuthUser();

  useEffect(() => {
    const controller = new AbortController();
    setIsLoading(true);
    setLoadError(null);

    apiClient
      .get<User[]>("/users", { signal: controller.signal })
      .then((response) => setUsers(response.data))
      .catch((error: unknown) => {
        if (error instanceof CanceledError) return;
        console.error("Failed to load users:", error);
        setLoadError("Unable to load users. Please try again.");
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false);
      });

    return () => controller.abort();
  }, []);

  const updateRole = async (user: User) => {
    setPendingUserId(user._id);
    setLoadError(null);
    try {
      const response = await apiClient.patch<User>(
        `/users/${user._id}/role`,
        { isAdmin: !user.isAdmin },
      );
      setUsers((currentUsers) =>
        currentUsers.map((currentUser) =>
          currentUser._id === user._id ? response.data : currentUser,
        ),
      );
      toast.success(
        response.data.isAdmin
          ? `${user.username} is now an administrator. They may need to sign in again to see admin tools.`
          : `${user.username} is now a standard user. They may need to sign in again.`,
      );
    } catch (error) {
      console.error("Failed to update user role:", error);
      const message =
        isAxiosError(error) && typeof error.response?.data === "string"
          ? error.response.data
          : "Unable to update this user's role. Please try again.";
      setLoadError(message);
      toast.error(message);
    } finally {
      setPendingUserId(null);
    }
  };

  const deleteUser = async (user: User) => {
    const confirmed = window.confirm(
      `Delete ${user.username} (${user.email})? This cannot be undone.`,
    );
    if (!confirmed) return;

    setPendingUserId(user._id);
    setLoadError(null);
    try {
      await apiClient.delete(`/users/${user._id}`);
      setUsers((currentUsers) =>
        currentUsers.filter((currentUser) => currentUser._id !== user._id),
      );
      toast.success(`${user.username} was deleted.`);
    } catch (error) {
      console.error("Failed to delete user:", error);
      const message =
        isAxiosError(error) && typeof error.response?.data === "string"
          ? error.response.data
          : "Unable to delete this user. Please try again.";
      setLoadError(message);
      toast.error(message);
    } finally {
      setPendingUserId(null);
    }
  };

  const adminCount = users.filter((user) => user.isAdmin).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-700">
            Administration
          </p>
          <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
            User management
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            Manage account access and administrator roles.
          </p>
        </div>
        <div className="inline-flex items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1.5 text-sm font-medium text-emerald-800">
          <UsersRound aria-hidden="true" className="size-4" />
          {isLoading ? "Loading users" : `${users.length} users`}
        </div>
      </div>

      {loadError && (
        <p
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {loadError}
        </p>
      )}

      <section
        aria-busy={isLoading}
        className="overflow-hidden rounded-xl border border-gray-200/80 bg-white shadow-sm"
      >
        <div className="overflow-x-auto">
          <table className="w-full min-w-[680px] text-left text-sm">
            <thead className="border-b border-gray-200 bg-gray-50 text-xs uppercase tracking-wide text-gray-600">
              <tr>
                <th scope="col" className="px-5 py-3 font-semibold">
                  User
                </th>
                <th scope="col" className="px-5 py-3 font-semibold">
                  Role
                </th>
                <th scope="col" className="px-5 py-3 text-right font-semibold">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr>
                  <td
                    colSpan={3}
                    className="px-5 py-12 text-center text-sm text-gray-500"
                  >
                    Loading users…
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td
                    colSpan={3}
                    className="px-5 py-12 text-center text-sm text-gray-500"
                  >
                    No users found.
                  </td>
                </tr>
              ) : (
                users.map((user) => {
                  const isCurrentUser = user._id === currentUser?._id;
                  const isSoleAdmin = user.isAdmin && adminCount <= 1;
                  const isPending = pendingUserId === user._id;

                  return (
                    <tr
                      key={user._id}
                      className="transition-colors hover:bg-emerald-50/30"
                    >
                      <td className="px-5 py-4">
                        <p className="font-semibold text-slate-900">
                          {user.username}
                          {isCurrentUser && (
                            <span className="ml-2 text-xs font-normal text-slate-500">
                              You
                            </span>
                          )}
                        </p>
                        <p className="mt-0.5 text-xs text-slate-500">
                          {user.email}
                        </p>
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
                            user.isAdmin
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-slate-100 text-slate-700"
                          }`}
                        >
                          {user.isAdmin ? (
                            <ShieldCheck
                              aria-hidden="true"
                              className="size-3.5"
                            />
                          ) : (
                            <Shield
                              aria-hidden="true"
                              className="size-3.5"
                            />
                          )}
                          {user.isAdmin ? "Administrator" : "Standard user"}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            disabled={
                              isPending || isCurrentUser || isSoleAdmin
                            }
                            title={
                              isCurrentUser
                                ? "You cannot change your own role"
                                : isSoleAdmin
                                  ? "The last administrator cannot be demoted"
                                  : undefined
                            }
                            onClick={() => void updateRole(user)}
                            className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {isPending
                              ? "Saving…"
                              : user.isAdmin
                                ? "Remove admin"
                                : "Make admin"}
                          </button>
                          <button
                            type="button"
                            disabled={
                              isPending || isCurrentUser || isSoleAdmin
                            }
                            title={
                              isCurrentUser
                                ? "You cannot delete your own account here"
                                : isSoleAdmin
                                  ? "The last administrator cannot be deleted"
                                  : undefined
                            }
                            onClick={() => void deleteUser(user)}
                            aria-label={`Delete ${user.username}`}
                            className="grid size-8 place-items-center rounded-lg text-red-600 transition hover:bg-red-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            <Trash2 aria-hidden="true" className="size-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
