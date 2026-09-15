import { z } from "zod";

export const datPhongFormSchema = z
  .object({
    contactName: z
      .string()
      .trim()
      .min(2, "Họ và tên phải có ít nhất 2 ký tự")
      .max(100, "Họ tên không được vượt quá 100 ký tự"),

    contactPhone: z
      .string()
      .trim()
      .regex(
        /^0[0-9]{9,10}$/,
        "Số điện thoại phải gồm 10 - 11 chữ số và bắt đầu bằng số 0",
      ),

    contactEmail: z
      .string()
      .trim()
      .optional()
      .or(z.literal(""))
      .refine((val) => !val || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val), {
        message: "Địa chỉ Email không đúng định dạng",
      }),

    // Không bắt buộc khi đặt online — lễ tân sẽ xác minh & bổ sung khi check-in đối chiếu giấy tờ thật
    idNumber: z
      .string()
      .trim()
      .optional()
      .or(z.literal(""))
      .refine((val) => !val || /^[0-9A-Za-z]{8,20}$/.test(val), {
        message: "Số CCCD/CMND/Hộ chiếu phải từ 8 đến 20 ký tự (chữ hoặc số)",
      }),

    checkInDate: z
      .string()
      .min(1, "Vui lòng chọn ngày nhận phòng")
      .refine((val) => {
        const today = new Date().toISOString().split("T")[0];
        return val >= today;
      }, "Ngày nhận phòng không được trước ngày hôm nay"),

    checkOutDate: z.string().min(1, "Vui lòng chọn ngày trả phòng"),

    // Input số lượng dạng Text, validate chỉ được nhập số
    numAdults: z
      .string()
      .trim()
      .regex(/^[0-9]+$/, "Số người lớn chỉ được nhập chữ số")
      .refine(
        (val) => parseInt(val, 10) >= 1,
        "Số người lớn phải lớn hơn hoặc bằng 1",
      ),

    numChildren: z
      .string()
      .trim()
      .regex(/^[0-9]+$/, "Số trẻ em chỉ được nhập chữ số")
      .refine((val) => parseInt(val, 10) >= 0, "Số trẻ em không được là số âm"),

    specialRequest: z
      .string()
      .max(500, "Ghi chú không quá 500 ký tự")
      .optional(),

    consentAccepted: z.boolean().refine((val) => val === true, {
      message:
        "Bạn bắt buộc phải đồng ý với Điều khoản Bảo vệ Dữ liệu Cá nhân theo Nghị định 356/2025/NĐ-CP",
    }),
  })
  .refine((data) => data.checkOutDate > data.checkInDate, {
    message: "Ngày trả phòng (Check-out) phải sau ngày nhận phòng (Check-in)",
    path: ["checkOutDate"],
  });

export type DatPhongFormData = z.infer<typeof datPhongFormSchema>;
