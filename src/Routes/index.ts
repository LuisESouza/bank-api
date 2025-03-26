import transaction from './transactionsRoutes';
import { auth } from '../middleware/auth';
import user from './userRoutes';
import express  from 'express';

const routes = express.Router();

routes.use('/user', user);
routes.use('/transactions',auth, transaction);

export default routes;