import {AttendanceController} from '../controllers/attendanceController'
import {Router} from 'express'
const attendancecontroller=new AttendanceController();
const router=Router();
router.get('/list',attendancecontroller.getAttendance)
router.post('/mark',attendancecontroller.markAttendance)
router.get('/users/list',attendancecontroller.getAllUsers)
export default router;
