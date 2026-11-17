import { useEffect, useState, type FormEvent } from "react";
import { NavLink, useLocation, useNavigate } from "react-router";

import { Footer } from "@/components/common/footer";
import { Header } from "@/components/common/header";
import { Button } from "@/components/ui/button";
import { ApiError, sectionApi } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import type { Program } from "@/types";

export default function AdminLoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [programs, setPrograms] = useState<Program[]>([]);
  const [years, setYears] = useState<number[]>([]);
  const [letters, setLetters] = useState<string[]>([]);

  const [program, setProgram] = useState("");
  const [year, setYear] = useState("");
  const [section, setSection] = useState("");
  const [password, setPassword] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    sectionApi
      .list()
      .then((data) => {
        if (cancelled) return;
        setPrograms(data.programs);
        setYears(data.years);
        setLetters(data.letters);
      })
      .catch(() => {
        if (!cancelled) setError("Unable to load section data.");
      });

    return () => {
      cancelled = true;
    };
  }, []);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      await login({ program, year: Number(year), section, password });

      const from = (location.state as { from?: string } | null)?.from;
      navigate(from ?? "/reservations", { replace: true });
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Unable to log in. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      <Header />

      <main className="flex-1">
        <div className="max-w-xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-white border border-slate-200 rounded-lg p-8">
            <h1 className="text-2xl font-bold text-[#071426]">
              Section Login
            </h1>

            <p className="text-sm text-slate-500 mt-1">
              Log in with your program, section, and password to manage your
              reservations.
            </p>

            {error && (
              <div className="mt-6 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
                {error}
              </div>
            )}

            <form
              onSubmit={handleSubmit}
              className="mt-6 space-y-5"
            >
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label
                    htmlFor="program"
                    className="block text-sm font-medium text-slate-700 mb-1"
                  >
                    Program
                  </label>

                  <select
                    id="program"
                    required
                    value={program}
                    onChange={(event) => setProgram(event.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#071426]/30"
                  >
                    <option value="">Select a program</option>
                    {programs.map((item) => (
                      <option key={item.program} value={item.program}>
                        {item.program}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="year"
                    className="block text-sm font-medium text-slate-700 mb-1"
                  >
                    Year
                  </label>

                  <select
                    id="year"
                    required
                    value={year}
                    onChange={(event) => setYear(event.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#071426]/30"
                  >
                    <option value="">Year</option>
                    {years.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="section"
                    className="block text-sm font-medium text-slate-700 mb-1"
                  >
                    Section
                  </label>

                  <select
                    id="section"
                    required
                    value={section}
                    onChange={(event) => setSection(event.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#071426]/30"
                  >
                    <option value="">Select a section</option>
                    {letters.map((letter) => (
                      <option key={letter} value={letter}>
                        Section {letter}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-slate-700 mb-1"
                >
                  Password
                </label>

                <input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#071426]/30"
                />
              </div>

              <Button
                type="submit"
                disabled={submitting || !program || !year || !section || !password}
                className="w-full"
              >
                {submitting ? "Logging in..." : "Log in"}
              </Button>
            </form>

            <p className="text-sm text-slate-500 mt-6 text-center">
              No account yet?{" "}
              <NavLink
                to="/admin/register"
                className="font-medium text-[#071426] underline"
              >
                Register your section
              </NavLink>
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}