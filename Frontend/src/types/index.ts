export type Building = {
  id: number;
  name: string;
  code: string | null;
  description: string | null;
};

export type RoomSlot = {
  start_time: string;
  end_time: string;
  purpose: string;
  status: ReservationStatus;
};

export type Room = {
  id: number;
  building_id: number | null;
  building?: Building | null;
  name: string;
  code: string | null;
  capacity: number;
  description: string | null;
  image: string | null;
  status: "available" | "maintenance";
  availability: "available" | "reserved" | "maintenance";
  is_available: boolean;
  todays_reservations_count: number;
  today_schedule: RoomSlot[];
};

export type Section = {
  id: number;
  program: string;
  year: number;
  section: string;
  label: string;
  reservations_count?: number;
};

export type Program = {
  program: string;
  label: string;
};

export type SectionList = {
  sections: Section[];
  programs: Program[];
  years: number[];
  letters: string[];
};

export type ReservationStatus =
  | "pending"
  | "approved"
  | "rejected"
  | "cancelled";

export type Reservation = {
  id: number;
  code: string;
  section_id: number;
  section?: Section;
  room_id: number;
  room?: Room;
  reservation_date: string;
  start_time: string;
  end_time: string;
  purpose: string;
  status: ReservationStatus;
  notes: string | null;
};

export type SectionAccount = {
  id: number;
  program: string;
  year: number;
  section: string;
  section_label: string;
  created_at: string;
};

export type ApiResponse<T> = {
  success: boolean;
  data: T;
  message?: string;
  errors?: Record<string, string[]>;
};