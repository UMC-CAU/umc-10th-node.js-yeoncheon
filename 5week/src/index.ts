import dotenv from "dotenv";
import express, { Express, Request, Response } from "express";
import cors from "cors";
import storeRouter from "./modules/store/Routes/store.route";
import missionRouter from "./modules/mission/Routes/mission.route";
import userRouter from "./modules/user/Routes/user.route";

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use("/api/v1/stores", storeRouter);
app.use("/api/v1", missionRouter);
app.use("/api/v1/users", userRouter);

app.get("/", (req: Request, res: Response) => {
  res.send("Hello World! This is TypeScript Server!");
});

app.listen(port, () => {
  console.log(`[server]: Server is running at <http://localhost>:${port}`);
});