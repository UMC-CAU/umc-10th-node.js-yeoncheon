import { Router } from "express";
import { handleUserSignUp } from "../controllers/user.controllers";

const userRouter = Router();

userRouter.post("/signup", handleUserSignUp);

export default userRouter;