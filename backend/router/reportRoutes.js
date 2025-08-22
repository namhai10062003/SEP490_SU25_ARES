import express from 'express';
import {
    getRecentPendingReport
} from '../controllers/reportController.js';
import isAdmin from '../middleware/isAdmin.js';

const router = express.Router();

//lấy 5 cái pending report gần nhất
router.get('/get-recent-pending-reports', getRecentPendingReport);

export default router;