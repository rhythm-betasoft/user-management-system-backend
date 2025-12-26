import { Request, Response } from "express";
import { AppDataSource } from "../dataSource";
import { User } from "../entity/User";
import { Attendance } from "../entity/attendance";
import { AttendanceType } from "../constants/enums";
const userRepository = AppDataSource.getRepository(User);
const attendanceRepository = AppDataSource.getRepository(Attendance);
function countSundaysMonthly(year: number, month: number): number {
  let sundays = 0;
  const firstDay = new Date(year, month - 1, 1);
  const lastDay = new Date(year, month, 0);

  for (
    let day = new Date(firstDay);
    day <= lastDay;
    day.setDate(day.getDate() + 1)
  ) {
    if (day.getDay() === 0) sundays++;
  }

  return sundays;
}
function computeStats(
  year: number,
  month: number,
  attendanceData: Record<string, string>
) {
  const stats = {
    totalPresent: 0,
    halfDayLeave: 0,
    fullDayLeave: 0,
    paidLeave: 0,
    totalWorkingDays: 0,
  };

  const totalDays = new Date(year, month, 0).getDate();
  const sundays = countSundaysMonthly(year, month);
  stats.totalWorkingDays = totalDays - sundays;

  for (let day = 1; day <= totalDays; day++) {
    const dateStr = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    const dateObj = new Date(dateStr);
    if (dateObj.getDay() === 0) continue;

    const status = attendanceData[dateStr] || "absent";

    if (status == AttendanceType.PRESENT || status === AttendanceType.FULLDAY)
      stats.totalPresent++;
    if (status === AttendanceType.HALFDAY) stats.halfDayLeave++;
    if (status === AttendanceType.FULLDAY || status === AttendanceType.HALFDAY)
      stats.fullDayLeave++;
    if (status === AttendanceType.PAIDLEAVE) stats.paidLeave++;
  }

  return stats;
}
export class AttendanceController {
  async markAttendance(req: Request, res: Response) {
    console.log(req.body);
    const { userId, date, status } = req.body;
    if (!userId) {
      return res.status(404).json({ message: "user id not found " });
    }
    const user = await userRepository.findOneBy({ id: Number(userId) });
    console.log(user);
    if (!user || !date || !status) {
      return res.status(404).json({ error: "User not found" });
    }
    const currentDate = new Date(date);
    const month = currentDate.getMonth() + 1;
    const year = currentDate.getFullYear();
    let attendance = await attendanceRepository.findOne({
      where: { user: { id: user.id }, month, year },
    });
    if (!attendance) {
      attendance = attendanceRepository.create({ user, month, year, data: {} });
    }
    attendance.data = attendance.data ?? {};
    attendance.data[date] = status;
    await attendanceRepository.save(attendance);
    res.json({
      message: "Attendance updated successfully",
      data: attendance.data,
    });
  }

  async getAttendance(req: Request, res: Response) {
    const { userId, month, year } = req.query;
    console.log(req.query);
    if (!userId || !month || !year) {
      return res.status(400).json({ error: "Missing userId, month, or year" });
    }
    try {
      const attendance = await attendanceRepository.findOne({
        where: {
          user: { id: Number(userId) },
          month: Number(month),
          year: Number(year),
        },
        relations: ["user"],
      });

      if (!attendance) {
        return res.status(404).json({ message: "Attendance record not found" });
      }
      let parsedData: any[] = [];
      if (typeof attendance.data === "string") {
        parsedData = JSON.parse(attendance.data);
      } else if (Array.isArray(attendance.data)) {
        parsedData = attendance.data;
      } else if (
        typeof attendance.data === "object" &&
        attendance.data !== null
      ) {
        parsedData = Object.entries(attendance.data).map(([date, status]) => ({
          date,
          status,
        }));
      }
      const events = parsedData.map((item) => ({
        start: item.date,
        color:
          item.status === "present"
            ? "green"
            : item.status === "halfday"
              ? "yellow"
              : "red",
      }));
      res.json({
        message: "Attendance retrieved successfully",
        events,
        data: attendance.data,
        month: attendance.month,
        year: attendance.year,
        userId: attendance.user.id,
      });
    } catch (error) {
      console.error("Error retrieving attendance:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }

  async getAllUsers(req: Request, res: Response) {
    try {
      const users = await userRepository.find();
      return res.status(200).json(users);
    } catch (err) {
      return res.status(500).json({ message: "Unable to get users ." });
    }
  }
}
