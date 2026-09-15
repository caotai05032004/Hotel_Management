import { useState, useEffect } from 'react';
import { ShieldAlert, CheckCircle, RefreshCw } from 'lucide-react';
import yeuCauDuLieuService, { type YeuCauDuLieuResponse } from '../../services/yeuCauDuLieuService';
import Button from '../../components/ui/Button';
import { toast } from 'sonner';
import { getErrorMessage } from '../../services/http';

export default function YeuCauDuLieuPage() {
  const [requests, setRequests] = useState<YeuCauDuLieuResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [approvingId, setApprovingId] = useState<string | null>(null);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await yeuCauDuLieuService.layTatCaYeuCauAdmin();
      setRequests(data);
    } catch (err: unknown) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleApprove = async (id: string) => {
    if (!window.confirm('Bạn có chắc chắn muốn Duyệt Xóa / Ẩn danh dữ liệu cá nhân theo Nghị định 356/2025/NĐ-CP?')) {
      return;
    }

    try {
      setApprovingId(id);
      await yeuCauDuLieuService.duyetYeuCau(id);
      toast.success('Đã duyệt yêu cầu xóa dữ liệu');
      await fetchRequests();
    } catch (err: unknown) {
      toast.error(getErrorMessage(err));
    } finally {
      setApprovingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <ShieldAlert className="text-amber-600" /> Quản lý Yêu cầu Dữ liệu Cá nhân
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Xử lý yêu cầu Xóa / Ẩn danh dữ liệu cá nhân tuân thủ Nghị định 356/2025/NĐ-CP, bảo lưu hồ sơ Cư trú gửi Công an khu vực theo Luật Cư trú.
          </p>
        </div>
        <Button onClick={fetchRequests} variant="outline" className="flex items-center gap-2">
          <RefreshCw size={14} /> Tải lại
        </Button>
      </div>

      {error && <div className="p-4 bg-red-50 text-red-700 text-sm rounded-xl border border-red-200">{error}</div>}

      {loading ? (
        <p className="text-sm text-gray-500 py-8 text-center">Đang tải danh sách yêu cầu...</p>
      ) : (
        <div className="bg-white rounded-xl shadow-soft border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-gray-600 font-semibold border-b border-gray-100">
                <tr>
                  <th className="p-4">Khách hàng</th>
                  <th className="p-4">Loại yêu cầu</th>
                  <th className="p-4">Lý do</th>
                  <th className="p-4">Thời gian gửi</th>
                  <th className="p-4">Trạng thái</th>
                  <th className="p-4 text-right">Thao tác Admin</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-700">
                {requests.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-gray-400">
                      Chưa có yêu cầu xử lý dữ liệu nào.
                    </td>
                  </tr>
                ) : (
                  requests.map((r) => (
                    <tr key={r.id} className="hover:bg-gray-50/80 transition-colors">
                      <td className="p-4">
                        <div className="font-semibold text-gray-900">{r.nguoiDungHoTen || r.nguoiDungEmail}</div>
                        <div className="text-xs text-gray-500">{r.nguoiDungEmail}</div>
                      </td>
                      <td className="p-4">
                        <span className="bg-amber-100 text-amber-800 px-2.5 py-1 rounded-full text-xs font-semibold">
                          {r.requestType === 'ERASURE' ? 'Xóa Dữ liệu (ND356)' : r.requestType}
                        </span>
                      </td>
                      <td className="p-4 text-xs text-gray-600 max-w-xs truncate">{r.reason}</td>
                      <td className="p-4 text-xs text-gray-500">
                        {r.requestedAt ? new Date(r.requestedAt).toLocaleString('vi-VN') : 'N/A'}
                      </td>
                      <td className="p-4">
                        {r.status === 'COMPLETED' ? (
                          <span className="bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-full text-xs font-semibold inline-flex items-center gap-1">
                            <CheckCircle size={12} /> Đã Duyệt Xóa
                          </span>
                        ) : (
                          <span className="bg-amber-100 text-amber-800 px-2.5 py-1 rounded-full text-xs font-semibold">
                            Chờ Admin Duyệt
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-right">
                        {r.status !== 'COMPLETED' && (
                          <Button
                            size="sm"
                            onClick={() => handleApprove(r.id)}
                            disabled={approvingId === r.id}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white"
                          >
                            {approvingId === r.id ? 'Đang duyệt...' : 'Duyệt Xóa (Approve)'}
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
