export const BOOKING_STATUS_CONFIG: Record<
  string,
  { label: string; color: string; description: string }
> = {
  PENDING: {
    label: "Chờ xác nhận",
    color: "bg-amber-100 text-amber-800 border-amber-300",
    description:
      "Đơn mới khởi tạo, khách đã khai đã chuyển khoản cọc, chờ lễ tân đối chiếu và xác nhận.",
  },
  CONFIRMED: {
    label: "Đã xác nhận",
    color: "bg-blue-100 text-blue-800 border-blue-300",
    description: "Đã cọc/xác nhận thành công, đang giữ phòng chờ khách đến.",
  },
  CHECKED_IN: {
    label: "Đang lưu trú",
    color: "bg-emerald-100 text-emerald-800 border-emerald-300",
    description: "Khách đã nhận phòng và đang ở tại khách sạn.",
  },
  CHECKED_OUT: {
    label: "Đã trả phòng",
    color: "bg-purple-100 text-purple-800 border-purple-300",
    description: "Khách đã thanh toán đủ và trả phòng hoàn tất.",
  },
  CANCELLED: {
    label: "Đã hủy",
    color: "bg-rose-100 text-rose-800 border-rose-300",
    description: "Đơn đặt phòng đã bị hủy.",
  },
  NO_SHOW: {
    label: "Khách không đến",
    color: "bg-slate-100 text-slate-800 border-slate-300",
    description: "Khách quá giờ check-in mà không đến và không báo trước.",
  },
};

export const DEPOSIT_RATIO = 0.3; // 30% tiền cọc
export const CANCELLATION_FREE_HOURS = 48; // Hủy trước 48h được hoàn 100% cọc
