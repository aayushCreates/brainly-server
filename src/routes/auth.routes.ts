import { Router } from "express";
import { googleAuth, login, logout, register } from "../controllers/auth.controller";
import passport from "passport";


const authRouter = Router();

authRouter.post('/register', register);
authRouter.post('/login', login);
authRouter.post('/logout', logout);

authRouter.get('/google', passport.authenticate("google", {
    scope: ["profile", "email"]
}));

authRouter.get(
    "/google/callback",
    passport.authenticate("google", { session: false }),
    googleAuth);

export default authRouter;