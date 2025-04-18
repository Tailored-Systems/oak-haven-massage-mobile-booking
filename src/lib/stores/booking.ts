import { writable } from 'svelte/store';
import type { Location } from '$lib/utils/location';

export type ServiceType = 'in-office' | 'in-home';
export type MassageType = 'relaxation' | 'deep-tissue' | 'therapeutic' | 'ashiatsu' | 'sports' | 'lymphatic' | 'reflexology' | 'targeted';
export type Duration = 25 | 50 | 80 | 110;
export type TherapistTier = 'I' | 'II' | 'III' | 'IV';
export type Gender = 'any' | 'male' | 'female';

export interface Therapist {
  id: string;
  name: string;
  tier: TherapistTier;
  gender: Gender;
}

export type TimeSlot = {
  time: string;
  therapist: Therapist;
};

export interface BookingSession {
  serviceType: ServiceType | null;
  location: Location | null;
  duration: Duration | null;
  massageType: MassageType | null;
  selectedDate: Date | null;
  selectedTimeSlot: TimeSlot | null;
  preferences: {
    gender: Gender;
    therapist: string | null;
    tier: TherapistTier | null;
  };
}

function createBookingStore() {
  const { subscribe, set, update } = writable<BookingSession>({
    serviceType: null,
    location: null,
    duration: null,
    massageType: null,
    selectedDate: null,
    selectedTimeSlot: null,
    preferences: {
      gender: 'any',
      therapist: null,
      tier: null
    }
  });

  return {
    subscribe,
    setServiceType: (serviceType: ServiceType) => 
      update(session => ({ ...session, serviceType })),
    setLocation: (location: Location) => 
      update(session => ({ ...session, location })),
    setDuration: (duration: Duration) =>
      update(session => ({ ...session, duration })),
    setMassageType: (massageType: MassageType) =>
      update(session => ({ ...session, massageType })),
    setSelectedDate: (date: Date) =>
      update(session => ({ ...session, selectedDate: date })),
    setSelectedTimeSlot: (timeSlot: TimeSlot) =>
      update(session => ({ ...session, selectedTimeSlot: timeSlot })),
    setPreferences: (preferences: Partial<BookingSession['preferences']>) =>
      update(session => ({
        ...session,
        preferences: { ...session.preferences, ...preferences }
      })),
    reset: () => set({
      serviceType: null,
      location: null,
      duration: null,
      massageType: null,
      selectedDate: null,
      selectedTimeSlot: null,
      preferences: {
        gender: 'any',
        therapist: null,
        tier: null
      }
    })
  };
}

export const bookingStore = createBookingStore(); 