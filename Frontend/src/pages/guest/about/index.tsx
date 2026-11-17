import { Footer } from "@/components/common/footer";
import { Header } from "@/components/common/header";

const features = [
  {
    title: "Room Management",
    description:
      "Browse all school facilities including classrooms, laboratories, and special-purpose rooms.",
  },
  {
    title: "Online Reservations",
    description:
      "Request a room reservation in just a few steps by selecting a facility, date, and time slot.",
  },
  {
    title: "Conflict Prevention",
    description:
      "The system automatically blocks overlapping reservations so no room is double-booked.",
  },
  {
    title: "Approval Workflow",
    description:
      "Reservations are reviewed by administrators before being approved, keeping bookings organized.",
  },
];

export default function AboutPage() {

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      <Header />

      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-[#071426]">About</h1>
            <p className="text-sm text-slate-500 mt-1">
              Cordova Public College Room Reservation System
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-lg p-6 lg:p-8 mb-6">
            <h2 className="text-xl font-bold text-[#071426] mb-3">
              SchoolReserve
            </h2>

            <p className="text-sm text-slate-600 leading-6 max-w-3xl">
              SchoolReserve is a web-based room reservation system built for
              Cordova Public College. It helps students, faculty, and staff
              reserve school facilities such as classrooms, computer
              laboratories, research rooms, and the Audio Visual Room. The
              system provides a centralized way to manage room availability,
              track reservation requests, and avoid scheduling conflicts.
            </p>

            <p className="text-sm text-slate-600 leading-6 max-w-3xl mt-3">
              The system is built with a layered architecture: a React
              frontend communicates with a Laravel API backend that separates
              controllers, services, repositories, and models for clean,
              maintainable code.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="bg-white border border-slate-200 rounded-lg p-6"
              >
                <h3 className="font-semibold text-[#071426]">
                  {feature.title}
                </h3>

                <p className="text-sm text-slate-600 mt-2 leading-6">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>

          <div className="bg-white border border-slate-200 rounded-lg p-6 mt-6">
            <h3 className="font-semibold text-[#071426] mb-2">
              Reserved by Section
            </h3>

            <p className="text-sm text-slate-600">
              Reservations are made on behalf of a class section. Choose your
              program (BSIT, BSED, BEED, or BSHM) and your section letter
              (A–Z) when requesting a room. No account or password is needed.
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}