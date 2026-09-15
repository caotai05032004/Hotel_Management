/** Ước tính số đêm / tổng tiền / tiền cọc phía Frontend trước khi đơn được tạo ở Backend (logic khớp với DatPhongServiceImpl#taoDatPhong). */
export function computeBookingEstimate(basePrice: number, checkInDate: string, checkOutDate: string) {
  const checkIn = new Date(checkInDate);
  const checkOut = new Date(checkOutDate);
  let nights = Math.round((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
  if (nights <= 0) nights = 1;

  const estimatedTotal = basePrice * nights;
  const depositAmount = estimatedTotal * 0.3;

  return { nights, estimatedTotal, depositAmount };
}
