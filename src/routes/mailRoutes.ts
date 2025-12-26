import {Router} from 'express'
import {mailController} from '../controllers/mailController'
const mailcontroller=new mailController();
const router=Router()
router.post('/send-invite',mailcontroller.sendInviteController)
export default router;
