import express  from 'express';
import user from './userRoutes';
import transaction from './transactionsRoutes';

const routes = express.Router();

routes.use('/user', user);
routes.use('/transactions', transaction);

export default routes;