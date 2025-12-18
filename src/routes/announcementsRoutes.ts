import {Router} from 'express'
import { AnnouncementController } from '../controllers/announcementController'
const router=Router();
const announcementcontroller= new AnnouncementController();
router.post('/add',announcementcontroller.createAnnouncement)
router.get('/list',announcementcontroller.getAllAnnouncements)
router.get("/:id", announcementcontroller.getAnnouncementById);
router.delete("/delete/:id",announcementcontroller.deleteAnnouncement)
router.put("/update/:id",announcementcontroller.updateAnnouncement)
export default router;