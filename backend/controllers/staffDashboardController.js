
import Fee from '../models/Fee.js';
import ParkingRegistration from '../models/ParkingRegistration.js';
import Resident from '../models/Resident.js';
import ResidentVerification from "../models/ResidentVerification.js";
// Thống kê doanh thu theo tháng từ các phí đã thanh toán
export const getMonthlyRevenue = async (req, res) => {
    try {
      const revenues = await Fee.aggregate([
        {
          $group: {
            _id: {
              month: '$month',
              status: '$status', // group theo tháng + trạng thái
            },
            totalAmount: { $sum: '$amount' },
          },
        },
        {
          $group: {
            _id: '$_id.month',
            revenues: {
              $push: {
                status: '$_id.status',
                total: '$totalAmount',
              },
            },
          },
        },
        { $sort: { _id: 1 } },
      ]);
  
      const monthNames = [
        '', 'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
      ];
  
      const formattedRevenue = revenues.map((r) => {
        const paid = r.revenues.find((x) => x.status === 'paid')?.total || 0;
        const unpaid = r.revenues.find((x) => x.status === 'unpaid')?.total || 0;
  
        return {
          month: monthNames[r._id] || `Tháng ${r._id}`,
          paid,
          unpaid,
        };
      });
  
      res.status(200).json({
        message: 'Revenue by month (paid & unpaid)',
        data: formattedRevenue,
      });
    } catch (error) {
      console.error('Error in getMonthlyRevenue:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  };
  
// Đếm số lượng theo trạng thái
const countResidentVerificationByStatus = async (req, res) => {
    try {
      const [pending, approved, rejected, total] = await Promise.all([
        ResidentVerification.countDocuments({ status: "Chờ duyệt" }),
        ResidentVerification.countDocuments({ status: "Đã duyệt" }),
        ResidentVerification.countDocuments({ status: "Đã từ chối" }),
        ResidentVerification.countDocuments({}) // 👈 đếm tất cả
      ]);
  
      res.json({
        pending,
        approved,
        rejected,
        total, // ✅ thêm trường tổng
      });
    } catch (error) {
      console.error("Error counting ResidentVerification by status:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  };

// đếm nhân khẩu
const countVerifiedAndRejectedResidents = async (req, res) => {
  try {
    const [verifiedCount, rejectedCount] = await Promise.all([
      Resident.countDocuments({ verifiedByStaff: true }),
      Resident.countDocuments({ verifiedByStaff: false, rejectReason: { $ne: null } }),
    ]);

    res.status(200).json({
      verifiedResidents: verifiedCount,
      rejectedResidents: rejectedCount,
    });
  } catch (error) {
    res.status(500).json({
      message: 'Lỗi khi đếm cư dân đã xác minh và từ chối',
      error: error.message,
    });
  }
};

// đếm phí 
const countFeesForStaff = async (req, res) => {
    try {
      const [total, paid, unpaid] = await Promise.all([
        Fee.countDocuments(),
        Fee.countDocuments({ paymentStatus: 'paid' }),
        Fee.countDocuments({ paymentStatus: 'unpaid' }),
      ]);
  
      res.status(200).json({
        message: 'Thống kê số lượng hóa đơn phí thành công',
        data: {
          total,
          paid,
          unpaid
        }
      });
    } catch (error) {
      console.error('❌ Lỗi khi thống kê phí:', error);
      res.status(500).json({ message: 'Lỗi server', error: error.message });
    }
  };

// đếm danh sách bãi đỗ xe
const countByStatusForStaff = async (req, res) => {
  try {
    const [pending, approved, rejected, total] = await Promise.all([
      ParkingRegistration.countDocuments({ status: 'pending' }),
      ParkingRegistration.countDocuments({ status: 'approved' }),
      ParkingRegistration.countDocuments({ status: 'rejected' }),
      ParkingRegistration.countDocuments()
    ]);

    res.status(200).json({
      message: 'Thống kê số lượng đăng ký gửi xe',
      data: {
        pending,
        approved,
        rejected,
        total
      }
    });
  } catch (err) {
    console.error('❌ Lỗi khi thống kê:', err);
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
};

export { countByStatusForStaff, countFeesForStaff, countResidentVerificationByStatus, countVerifiedAndRejectedResidents };

