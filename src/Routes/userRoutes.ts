import * as userController from '../Controllers/userController'
import express from 'express';

const routes = express.Router();

//Post users
routes.post('/register', userController.registerUser);
routes.post('/login', userController.loginUser);

//Get users
routes.get('/profile/:user_id', userController.searchUser);
routes.get('/wallet/:user_id', userController.walletGet);

export default routes;