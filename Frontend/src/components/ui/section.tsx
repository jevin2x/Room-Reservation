import { Card } from "@/components/ui/card";

const rooms = [
  {
    title: "Room 101",
    description:
      "Standard classroom with a capacity of 40 students.",
    image:
      "https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=800&q=80",
  },
  {
    title: "Computer Laboratory",
    description:
      "Computer laboratory with 30 workstations available.",
    image:
      "https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=800&q=80",
  },
  {
    title: "Audio Visual Room",
    description:
      "Multi-purpose room for presentations, seminars, and events.",
    image:
      "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=800&q=80",
  },
];

export function RoomSection() {
  return (
    <section className="bg-slate-50 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <p className="text-sm font-semibold text-slate-500 uppercase tracking-wide">
            Facilities
          </p>

          <h2 className="text-3xl font-bold text-slate-900 mt-2">
            Available Rooms
          </h2>

          <p className="text-slate-600 mt-3 max-w-2xl mx-auto">
            Browse available school rooms and reserve the facility
            that best fits your needs.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rooms.map((room) => (
            <Card
              key={room.title}
              title={room.title}
              description={room.description}
              image={room.image}
              buttonLabel="View Room"
              buttonVariant="secondary"
            />
          ))}
        </div>
      </div>
    </section>
  );
}