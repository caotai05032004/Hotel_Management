/* eslint-disable react-hooks/purity */
import React, { useState } from 'react';
import { Eye, EyeOff, ShieldCheck } from 'lucide-react';
import Button from '../ui/Button';
import { Input } from '../ui/Field';
import { datPhongFormSchema, type DatPhongFormData } from '../../validations/datPhongValidation';
import type { DatPhongCreateRequest, HangPhongResponse } from '../../types';

interface BookingFormProps {
  hangPhong: HangPhongResponse;
  initialValues?: DatPhongFormData;
  onSubmit: (formData: DatPhongFormData, payload: DatPhongCreateRequest) => void;
  onCancel: () => void;
}

export default function BookingForm({ hangPhong, initialValues, onSubmit, onCancel }: BookingFormProps) {
  const todayStr = new Date().toISOString().split('T')[0];
  const tomorrowStr = new Date(Date.now() + 86400000).toISOString().split('T')[0];

  // initialValues chỉ được đọc 1 lần lúc mount để khôi phục dữ liệu khi user bấm "Quay lại" từ bước sau
  const [formData, setFormData] = useState<DatPhongFormData>(
    () =>
      initialValues ?? {
        contactName: '',
        contactPhone: '',
        contactEmail: '',
        idNumber: '',
        checkInDate: todayStr,
        checkOutDate: tomorrowStr,
        numAdults: '1',
        numChildren: '0',
        specialRequest: '',
        consentAccepted: false,
      }
  );

  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof DatPhongFormData, string>>>({});
  const [showIdNumber, setShowIdNumber] = useState(false);

  const handleChange = (field: keyof DatPhongFormData) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const val = e.target.type === 'checkbox' ? (e.target as HTMLInputElement).checked : e.target.value;
    setFormData((prev) => ({ ...prev, [field]: val }));
    // Clear error when user types
    if (fieldErrors[field]) {
      setFieldErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFieldErrors({});

    // Validate bằng Zod Schema ở Frontend
    const validationResult = datPhongFormSchema.safeParse(formData);
    if (!validationResult.success) {
      const errors: Partial<Record<keyof DatPhongFormData, string>> = {};
      validationResult.error.issues.forEach((issue) => {
        const pathKey = issue.path[0] as keyof DatPhongFormData;
        if (pathKey) {
          errors[pathKey] = issue.message;
        }
      });
      setFieldErrors(errors);
      return;
    }

    const validData = validationResult.data;

    const payload: DatPhongCreateRequest = {
      hangPhongId: hangPhong.id,
      contactName: validData.contactName,
      contactEmail: validData.contactEmail || '',
      contactPhone: validData.contactPhone,
      idNumber: validData.idNumber,
      checkInDate: validData.checkInDate,
      checkOutDate: validData.checkOutDate,
      numAdults: parseInt(validData.numAdults, 10),
      numChildren: parseInt(validData.numChildren, 10),
      specialRequest: validData.specialRequest || '',
      consentAccepted: validData.consentAccepted,
    };

    onSubmit(formData, payload);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 mt-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Họ và tên *"
          placeholder="Ví dụ: Nguyễn Văn A"
          value={formData.contactName}
          onChange={handleChange('contactName')}
          error={fieldErrors.contactName}
        />
        <Input
          label="Số điện thoại liên hệ *"
          placeholder="0912345678"
          value={formData.contactPhone}
          onChange={handleChange('contactPhone')}
          error={fieldErrors.contactPhone}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Email nhận xác nhận"
          type="email"
          placeholder="example@gmail.com"
          value={formData.contactEmail}
          onChange={handleChange('contactEmail')}
          error={fieldErrors.contactEmail}
        />

        {/* Ô nhập số CCCD tích hợp nút Toggle Eye/EyeOff ẩn hiện riêng tư - không bắt buộc */}
        <div className="relative">
          <Input
            label="Số CCCD / Hộ chiếu"
            type={showIdNumber ? 'text' : 'password'}
            placeholder="Lễ tân sẽ xác minh khi check-in"
            value={formData.idNumber}
            onChange={handleChange('idNumber')}
            error={fieldErrors.idNumber}
          />
          <button
            type="button"
            onClick={() => setShowIdNumber(!showIdNumber)}
            className="absolute right-3 top-9 text-gray-400 hover:text-gray-600"
            title={showIdNumber ? 'Ẩn số CCCD' : 'Hiện số CCCD'}
          >
            {showIdNumber ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Ngày nhận phòng (Check-in) *"
          type="date"
          min={todayStr}
          value={formData.checkInDate}
          onChange={handleChange('checkInDate')}
          error={fieldErrors.checkInDate}
        />
        <Input
          label="Ngày trả phòng (Check-out) *"
          type="date"
          min={formData.checkInDate || todayStr}
          value={formData.checkOutDate}
          onChange={handleChange('checkOutDate')}
          error={fieldErrors.checkOutDate}
        />
      </div>

      {/* Input Số lượng dạng Text, validate chỉ được nhập số */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Số người lớn *"
          type="text"
          placeholder="1"
          value={formData.numAdults}
          onChange={handleChange('numAdults')}
          error={fieldErrors.numAdults}
        />
        <Input
          label="Số trẻ em *"
          type="text"
          placeholder="0"
          value={formData.numChildren}
          onChange={handleChange('numChildren')}
          error={fieldErrors.numChildren}
        />
      </div>

      {/* Điều khoản Bảo vệ dữ liệu cá nhân theo Nghị định 356/2025 */}
      <div className="rounded-xl bg-emerald-50/70 border border-emerald-200/80 p-3.5 text-xs text-emerald-900">
        <div className="flex items-start gap-2.5">
          <ShieldCheck size={20} className="text-emerald-700 shrink-0 mt-0.5" />
          <div>
            <label className="flex items-center gap-2 font-medium cursor-pointer">
              <input
                type="checkbox"
                checked={formData.consentAccepted}
                onChange={handleChange('consentAccepted')}
                className="h-4 w-4 rounded border-emerald-300 text-emerald-600 focus:ring-emerald-500"
              />
              <span>
                Tôi đồng ý cho phép Khách sạn xử lý và bảo vệ dữ liệu cá nhân / CCCD theo quy định tại Nghị định 356/2025/NĐ-CP & Luật Cư trú.
              </span>
            </label>
            {fieldErrors.consentAccepted && (
              <p className="mt-1 text-xs font-semibold text-red-600">{fieldErrors.consentAccepted}</p>
            )}
          </div>
        </div>
      </div>

      <div className="pt-2 flex justify-between items-center">
        <div>
          <span className="text-xs text-gray-500 block">Giá phòng 1 đêm:</span>
          <span className="text-lg font-bold text-emerald-700">
            {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(hangPhong.basePrice)}
          </span>
        </div>
        <div className="flex gap-3">
          <Button type="button" variant="outline" onClick={onCancel}>
            Hủy
          </Button>
          <Button type="submit">
            Tiếp tục
          </Button>
        </div>
      </div>
    </form>
  );
}
