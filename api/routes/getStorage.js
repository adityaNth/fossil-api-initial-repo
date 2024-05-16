import express from 'express';
import callMEVBlockerAPI from '../../controller/calculateGetStorage';

const router = express.Router();

router.get('/', async (req, res) => {
  callMEVBlockerAPI(req, res);
});


export default router;
