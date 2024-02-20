import express from "express";
import errorHandler from "./middleware/errorHandler";
import fourOhFour from "./middleware/fourOhFour";
import root from "./routes/root";
import { API } from "./middleware/api";

const app = express();

// Apply most middleware first
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(API);

// Apply routes before error handling
app.use("/", root);

// Apply error handling last
app.use(fourOhFour);
app.use(errorHandler);

console.log("App Key", process.env.API_KEY);
export default app;
