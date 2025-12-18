import {Router} from 'express'
import {DashboardController} from '../controllers/dashboardController'
const router=Router();
const dashboardcontroller=new DashboardController();
router.get('/cards',dashboardcontroller.getDashboardCards)
router.get('/blood-groups',dashboardcontroller.getBloodGroupCount)
router.get('/age-distribution',dashboardcontroller.getAgeCount)
export default router;