import {Router} from 'express'
import {LeaveController} from '../controllers/leaveController'
const router=Router()
const leavecontroller=new LeaveController()
router.post('/apply',leavecontroller.ApplyLeave)
export default router;