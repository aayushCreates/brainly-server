import { getProfile, updateProfile } from '@/controllers/profile.controller';
import { isUserLoggedIn } from '@/middlewares/auth.middleware';
import { Router } from 'express';

const profileRouter = Router();

profileRouter.get('/', isUserLoggedIn, getProfile);
profileRouter.put('/', isUserLoggedIn, updateProfile);

export default profileRouter;

