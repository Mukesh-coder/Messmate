
import { Mess, DayMenu } from './types';

export const MESSES: Mess[] = [
  { 
    id: 'm1', 
    ownerId: 'system',
    name: 'Emerald Heights Mess', 
    location: 'North Campus', 
    coords: { lat: 12.9716, lng: 77.5946 }, 
    capacity: 500,
    isOpen: true,
    isVegOnly: false,
    avgRating: 4.5,
    reviews: [],
    viewCount: 1250,
    liveDiners: 0,
    description: 'Premium dining hall focusing on hygiene and authentic taste.',
    operatingHours: { 
      breakfast: '7:30 AM - 9:30 AM',
      lunch: '12:30 PM - 2:30 PM', 
      dinner: '7:30 PM - 9:30 PM' 
    }
  },
  { 
    id: 'm2', 
    ownerId: 'system',
    name: 'Skyline Dining Hall', 
    location: 'South Campus', 
    coords: { lat: 12.9616, lng: 77.5846 }, 
    capacity: 350,
    isOpen: true,
    isVegOnly: true,
    avgRating: 4.2,
    reviews: [],
    viewCount: 890,
    liveDiners: 0,
    description: 'Authentic home-style vegetarian kitchen.',
    operatingHours: { 
      breakfast: '8:00 AM - 10:00 AM',
      lunch: '1:00 PM - 3:00 PM', 
      dinner: '8:00 PM - 10:00 PM' 
    }
  }
];

export const INITIAL_MENUS: DayMenu[] = [
  {
    id: '1',
    date: new Date().toISOString().split('T')[0],
    messId: 'm1',
    breakfast: ['Poha', 'Boiled Eggs', 'Tea'],
    lunch: ['Paneer Tikka', 'Jeera Rice', 'Gulab Jamun'],
    dinner: ['Chicken Biryani', 'Raita', 'Ice Cream'],
    note: 'Special Dessert tonight!'
  }
];
