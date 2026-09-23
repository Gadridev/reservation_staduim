import { useState, type FormEvent } from "react";
import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Input } from "../components/ui/Input";
import { changePasswordRequest, updateUserRequest } from "../features/auth/api";
import { useAuthStore } from "../features/auth/store";

export function ProfilePage() {
  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);
  const [personalInfo, setPersonalInfo] = useState({
    firstName: user?.firstName ?? "",
    lastName: user?.lastName ?? "",
    email: user?.email ?? "",
  });
  const [password, setPassword] = useState({
    oldPassword: "",
    newPassword: "",
    confirmNewPassword: "",
  });

  const updateUser = useMutation({
    mutationFn: updateUserRequest,
    onSuccess: (_, values) => {
      if (user) setUser({ ...user, ...values });
      toast.success("Profile updated successfully.");
    },
    onError: (error) => toast.error(error.message),
  });

  const changePassword = useMutation({
    mutationFn: changePasswordRequest,
    onSuccess: () => {
      setPassword({ oldPassword: "", newPassword: "", confirmNewPassword: "" });
      toast.success("Password updated successfully.");
    },
    onError: (error) => toast.error(error.message),
  });

  function handlePersonalInfoSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    updateUser.mutate(personalInfo);
  }

  function handlePasswordSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (password.newPassword !== password.confirmNewPassword) {
      toast.error("New passwords do not match.");
      return;
    }
    changePassword.mutate(password);
  }

  return (
    <div className="min-h-screen bg-cream pb-16">
      <div className="mx-auto max-w-[900px] px-7 py-10 sm:px-10">
        <h1 className="font-display text-[44px] font-black uppercase leading-none tracking-wide text-ink sm:text-[54px]">
          My Profile
        </h1>
        <p className="mt-3 text-sm text-ink-soft sm:text-base">
          Manage your personal information and password.
        </p>

        <Card className="mt-9 rounded-[20px] p-6 sm:p-8">
          <h2 className="font-display text-[28px] font-black uppercase tracking-wide text-ink">
            Personal Information
          </h2>
          <form onSubmit={handlePersonalInfoSubmit}>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="rounded-lg border border-line bg-chalk px-4 py-3 focus-within:border-turf">
                <Input
                  label="First name"
                  required
                  value={personalInfo.firstName}
                  onChange={(event) =>
                    setPersonalInfo({ ...personalInfo, firstName: event.target.value })
                  }
                />
              </div>
              <div className="rounded-lg border border-line bg-chalk px-4 py-3 focus-within:border-turf">
                <Input
                  label="Last name"
                  required
                  value={personalInfo.lastName}
                  onChange={(event) =>
                    setPersonalInfo({ ...personalInfo, lastName: event.target.value })
                  }
                />
              </div>
              <div className="rounded-lg border border-line bg-chalk px-4 py-3 focus-within:border-turf sm:col-span-2">
                <Input
                  label="Email"
                  type="email"
                  required
                  value={personalInfo.email}
                  onChange={(event) =>
                    setPersonalInfo({ ...personalInfo, email: event.target.value })
                  }
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end">
              <Button type="submit" variant="dark" isLoading={updateUser.isPending}>
                Save changes
              </Button>
            </div>
          </form>
        </Card>

        <Card className="mt-6 rounded-[20px] p-6 sm:p-8">
          <h2 className="font-display text-[28px] font-black uppercase tracking-wide text-ink">
            Change Password
          </h2>
          <form onSubmit={handlePasswordSubmit}>
            <div className="mt-6 space-y-4">
              <div className="rounded-lg border border-line bg-chalk px-4 py-3 focus-within:border-turf">
                <Input
                  label="Current password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password.oldPassword}
                  onChange={(event) => setPassword({ ...password, oldPassword: event.target.value })}
                />
              </div>
              <div className="rounded-lg border border-line bg-chalk px-4 py-3 focus-within:border-turf">
                <Input
                  label="New password"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={password.newPassword}
                  onChange={(event) => setPassword({ ...password, newPassword: event.target.value })}
                />
              </div>
              <div className="rounded-lg border border-line bg-chalk px-4 py-3 focus-within:border-turf">
                <Input
                  label="Confirm new password"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={password.confirmNewPassword}
                  onChange={(event) =>
                    setPassword({ ...password, confirmNewPassword: event.target.value })
                  }
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end">
              <Button type="submit" variant="dark" isLoading={changePassword.isPending}>
                Update password
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
