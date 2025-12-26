import {Router} from 'express'
import {PlanController} from '../controllers/planController'
const router=Router()
const plancontroller=new PlanController()
router.get('/list',plancontroller.getPlans)
export default router;