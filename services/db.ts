
import { User, DayMenu, Mess, Review, Notification, MealBooking } from '../types';
import { INITIAL_MENUS, MESSES } from '../constants';

const USERS_KEY = 'mess_app_users';
const MENUS_KEY = 'mess_app_menus';
const MESSES_KEY = 'mess_app_messes';
const NOTIFS_KEY = 'mess_app_notifs';
const BOOKINGS_KEY = 'mess_app_bookings';

export const db = {
  getUsers: (): User[] => {
    const data = localStorage.getItem(USERS_KEY);
    return data ? JSON.parse(data) : [];
  },

  saveUser: (user: User) => {
    const users = db.getUsers();
    const index = users.findIndex(u => u.id === user.id);
    if (index > -1) {
      users[index] = user;
    } else {
      users.push(user);
    }
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  },

  updateUser: (updatedUser: User) => {
    db.saveUser(updatedUser);
  },

  getMesses: (): Mess[] => {
    const data = localStorage.getItem(MESSES_KEY);
    const defaultMesses = MESSES.map(m => ({ ...m, ownerId: 'system', liveDiners: Math.floor(Math.random() * m.capacity) }));
    return data ? JSON.parse(data) : defaultMesses;
  },

  saveMess: (mess: Mess) => {
    const messes = db.getMesses();
    const index = messes.findIndex(m => m.id === mess.id);
    if (index > -1) {
      messes[index] = mess;
    } else {
      messes.push(mess);
    }
    localStorage.setItem(MESSES_KEY, JSON.stringify(messes));
  },

  updateMess: (updatedMess: Mess) => {
    db.saveMess(updatedMess);
    window.dispatchEvent(new CustomEvent('mess-updated', { detail: { mess: updatedMess } }));
  },

  getNotifications: (userId: string): Notification[] => {
    const data = localStorage.getItem(`${NOTIFS_KEY}_${userId}`);
    return data ? JSON.parse(data) : [];
  },

  addNotification: (userId: string, notification: Omit<Notification, 'id' | 'timestamp' | 'isRead'>) => {
    const notifs = db.getNotifications(userId);
    const newNotif: Notification = {
      ...notification,
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toISOString(),
      isRead: false
    };
    notifs.unshift(newNotif);
    localStorage.setItem(`${NOTIFS_KEY}_${userId}`, JSON.stringify(notifs.slice(0, 20)));
    window.dispatchEvent(new CustomEvent('new-notification', { detail: { userId, notification: newNotif } }));
  },

  broadcastNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'isRead'>) => {
    const users = db.getUsers();
    users.forEach(u => db.addNotification(u.id, notification));
  },

  getMenus: (messId?: string): DayMenu[] => {
    const data = localStorage.getItem(MENUS_KEY);
    let menus: DayMenu[] = data ? JSON.parse(data) : INITIAL_MENUS;
    if (messId) {
      menus = menus.filter(m => m.messId === messId);
    }
    return menus;
  },

  saveMenu: (menu: DayMenu) => {
    const menus = db.getMenus();
    const index = menus.findIndex(m => m.date === menu.date && m.messId === menu.messId);
    if (index > -1) {
      menus[index] = menu;
    } else {
      menus.push(menu);
    }
    localStorage.setItem(MENUS_KEY, JSON.stringify(menus));
    window.dispatchEvent(new CustomEvent('menu-updated', { detail: { menu } }));
    db.broadcastNotification({
      title: 'Menu Updated!',
      message: `Chef just updated today's special. Check it out now!`,
      type: 'SUCCESS'
    });
  },

  getBookings: (userId: string): MealBooking[] => {
    const data = localStorage.getItem(`${BOOKINGS_KEY}_${userId}`);
    return data ? JSON.parse(data) : [];
  },

  saveBooking: (userId: string, booking: MealBooking) => {
    const bookings = db.getBookings(userId);
    bookings.push(booking);
    localStorage.setItem(`${BOOKINGS_KEY}_${userId}`, JSON.stringify(bookings));
  },

  cancelBooking: (userId: string, bookingId: string) => {
    const bookings = db.getBookings(userId);
    const updated = bookings.filter(b => b.id !== bookingId);
    localStorage.setItem(`${BOOKINGS_KEY}_${userId}`, JSON.stringify(updated));
  }
};
