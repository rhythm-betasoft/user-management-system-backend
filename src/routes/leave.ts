import {Router} from 'express'
import {LeaveController} from '../controllers/leaveController'
import {authMiddleware} from '../middlewares/authMiddleware'
const router=Router()
const leavecontroller=new LeaveController()
router.post('/apply',authMiddleware,leavecontroller.ApplyLeave)
router.get('/lists',leavecontroller.showAllLeaves)
router.get('/list',authMiddleware,leavecontroller.showUserLeaves)
router.post('/approve',leavecontroller.approveLeaves)
router.post('/disapprove',leavecontroller.disapproveLeaves)
export default router;