export enum ROOM_STATUS {
  VACANT = 'VACANT',
  OCCUPIED = 'OCCUPIED',
  DIRTY = 'DIRTY',
  MAINTENANCE = 'MAINTENANCE',
}

export const ROOM_STATUS_CONFIG: Record<
  string,
  { label: string; color: string; description: string }
> = {
  VACANT: {
    label: 'Đang hoạt động (Trống)',
    color: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    description: 'Phòng đã sẵn sàng và có thể gán đón khách mới.',
  },
  OCCUPIED: {
    label: 'Đang có khách',
    color: 'bg-blue-100 text-blue-800 border-blue-300',
    description: 'Phòng hiện đang có khách lưu trú.',
  },
  DIRTY: {
    label: 'Đang dọn dẹp',
    color: 'bg-amber-100 text-amber-800 border-amber-300',
    description: 'Phòng vừa checkout, đang chờ bộ phận buồng phòng vệ sinh.',
  },
  MAINTENANCE: {
    label: 'Bảo trì (Tạm ngưng)',
    color: 'bg-rose-100 text-rose-800 border-rose-300',
    description: 'Phòng đang gặp sự cố kỹ thuật hoặc nâng cấp thiết bị.',
  },
};
