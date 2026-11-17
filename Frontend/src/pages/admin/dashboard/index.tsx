import { useEffect, useState, type FormEvent } from "react";

import { Footer } from "@/components/common/footer";
import { Header } from "@/components/common/header";
import { Button } from "@/components/ui/button";
import { adminApi, ApiError } from "@/lib/api";
import type { SectionAccount } from "@/types";

type EditingState = {
  id: number;
  password: string;
  confirmation: string;
  saving: boolean;
};

export default function AdminDashboardPage() {
  const [accounts, setAccounts] = useState<SectionAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const [editing, setEditing] = useState<EditingState | null>(null);

  useEffect(() => {
    let cancelled = false;

    adminApi
      .listSections()
      .then((data) => {
        if (cancelled) return;
        setAccounts(data);
      })
      .catch((err) => {
        if (!cancelled) {
          setError(
            err instanceof ApiError
              ? err.message
              : "Unable to load registered sections.",
          );
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  function startEditing(account: SectionAccount) {
    setNotice(null);
    setError(null);
    setEditing({ id: account.id, password: "", confirmation: "", saving: false });
  }

  async function handleSave(event: FormEvent) {
    event.preventDefault();
    if (!editing) return;

    setEditing((current) => (current ? { ...current, saving: true } : current));

    try {
      const updated = await adminApi.changePassword(editing.id, {
        password: editing.password,
        password_confirmation: editing.confirmation,
      });

      setAccounts((current) =>
        current.map((account) =>
          account.id === updated.id ? updated : account,
        ),
      );
      setEditing(null);
      setNotice(`Password updated for ${updated.section_label}.`);
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Unable to update the password.",
      );
      setEditing((current) => (current ? { ...current, saving: false } : current));
    }
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      <Header />

      <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
        <h1 className="text-2xl font-bold text-[#071426]">
          Admin Dashboard
        </h1>

        <p className="text-sm text-slate-500 mt-1">
          Manage the registered section accounts: update passwords or remove
          accounts.
        </p>

        {notice && (
          <div className="mt-6 bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg px-4 py-3">
            {notice}
          </div>
        )}

        {error && (
          <div className="mt-6 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
            {error}
          </div>
        )}

        <div className="mt-8 bg-white border border-slate-200 rounded-lg overflow-hidden">
          {loading ? (
            <div className="px-6 py-10 text-center text-sm text-slate-500">
              Loading registered sections...
            </div>
          ) : accounts.length === 0 ? (
            <div className="px-6 py-10 text-center text-sm text-slate-500">
              No sections have registered accounts yet.
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-left text-xs text-slate-500 uppercase">
                  <th className="px-6 py-3 font-medium">Section</th>
                  <th className="px-6 py-3 font-medium">Program</th>
                  <th className="px-6 py-3 font-medium">Registered</th>
                  <th className="px-6 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {accounts.map((account) => (
                  <tr key={account.id}>
                    <td className="px-6 py-4 font-medium text-[#071426]">
                      {account.section_label}
                    </td>

                    <td className="px-6 py-4 text-slate-600">
                      {account.program}
                    </td>

                    <td className="px-6 py-4 text-slate-500">
                      {new Date(account.created_at).toLocaleDateString()}
                    </td>

                    <td className="px-6 py-4 text-right whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => startEditing(account)}
                        className="text-sm font-medium text-[#071426] hover:underline"
                      >
                        Change Password
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {editing && (
          <div className="mt-8 bg-white border border-slate-200 rounded-lg p-6">
            <h2 className="text-lg font-bold text-[#071426]">
              Change Password
            </h2>

            <p className="text-sm text-slate-500 mt-1">
              Set a new password for this section. Existing sessions will be
              signed out.
            </p>

            <form onSubmit={handleSave} className="mt-4 space-y-4 max-w-md">
              <div>
                <label
                  htmlFor="new-password"
                  className="block text-sm font-medium text-slate-700 mb-1"
                >
                  New Password
                </label>

                <input
                  id="new-password"
                  type="password"
                  required
                  minLength={6}
                  value={editing.password}
                  onChange={(event) =>
                    setEditing({
                      ...editing,
                      password: event.target.value,
                    })
                  }
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#071426]/30"
                />
              </div>

              <div>
                <label
                  htmlFor="confirm-password"
                  className="block text-sm font-medium text-slate-700 mb-1"
                >
                  Confirm New Password
                </label>

                <input
                  id="confirm-password"
                  type="password"
                  required
                  minLength={6}
                  value={editing.confirmation}
                  onChange={(event) =>
                    setEditing({
                      ...editing,
                      confirmation: event.target.value,
                    })
                  }
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#071426]/30"
                />
              </div>

              <div className="flex items-center gap-3">
                <Button
                  type="submit"
                  disabled={
                    editing.saving ||
                    editing.password.length < 6 ||
                    editing.password !== editing.confirmation
                  }
                >
                  {editing.saving ? "Saving..." : "Save Password"}
                </Button>

                <button
                  type="button"
                  onClick={() => setEditing(null)}
                  className="text-sm font-medium text-slate-500 hover:text-slate-700"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}