const PATH = {
  LOGIN: "/login",
  REGISTER: "/register",
  HOME: "/",
  ROOMS: "/rooms",
  ROOM_DETAIL: "/rooms/:id",
  PROFILE: "/profile",
  MY_BOOKINGS: "/my-bookings",
  FORBIDDEN: "/403",
  NOT_FOUND: "/404",
  ABOUT_ME: "/about-me",
  ADMIN: "/admin",
  ADMIN_ROOMS: "/admin/phong",
  ADMIN_ROOM_TYPES: "/admin/hang-phong",
  ADMIN_DASHBOARD: "/admin/dashboard",
  ADMIN_ACCOUNTS: "/admin/tai-khoan",
  ADMIN_RESERVATIONS: "/admin/dat-phong",
  ADMIN_TRANSACTIONS: "/admin/thanh-toan",
  ADMIN_DATA_REQUESTS: "/admin/yeu-cau-du-lieu",
} as const;

export default PATH;
