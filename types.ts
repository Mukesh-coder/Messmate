
export enum UserRole {
  STUDENT = 'STUDENT',
  ADMIN = 'ADMIN'
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  type: 'INFO' | 'SUCCESS' | 'ALERT';
  isRead: boolean;
}

export interface UserPreferences {
  diet: 'VEG' | 'NON_VEG' | 'BOTH';
  allergies: string[];
  spiceLevel: 'MILD' | 'MEDIUM' | 'HOT';
}

export interface UserSettings {
  notifications: {
    lunchReminders: boolean;
    dinnerReminders: boolean;
    weeklyReports: boolean;
  };
  darkMode: boolean;
}

export interface MealBooking {
  id: string;
  userId: string;
  messId: string;
  date: string;
  mealType: 'BREAKFAST' | 'LUNCH' | 'DINNER';
  status: 'CONFIRMED' | 'CANCELLED';
  timestamp: string;
  selectedItems?: string[];
}

export interface User {
  id: string;
  email: string;
  role: UserRole;
  messId?: string;
  primaryMessId?: string;
  hasCompletedOnboarding?: boolean;
  favorites?: string[];
  preferences?: UserPreferences;
  settings?: UserSettings;
  bookings?: MealBooking[];
}

export interface Location {
  lat: number;
  lng: number;
}

export interface Review {
  id: string;
  userId: string;
  userEmail: string;
  rating: number;
  comment: string;
  date: string;
}

export interface Mess {
  id: string;
  ownerId: string;
  name: string;
  location: string;
  coords: Location;
  capacity: number;
  isOpen: boolean;
  isVegOnly: boolean;
  avgRating: number;
  reviews: Review[];
  viewCount: number;
  liveDiners: number; 
  description?: string;
  operatingHours?: {
    breakfast: string;
    lunch: string;
    dinner: string;
  };
}

export interface DayMenu {
  id: string;
  date: string;
  messId: string;
  breakfast: string[];
  lunch: string[];
  dinner: string[];
  images?: string[];
  note?: string;
}
