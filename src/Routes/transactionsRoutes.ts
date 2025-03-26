import * as walletController from '../Controllers/walletController';
import express from 'express';

const routes = express.Router();

//Post tranfer
routes.post('/transfer', walletController.walletTransfer);

//Put deposit
routes.put('/deposit/', walletController.walletDeposit);
export default routes;