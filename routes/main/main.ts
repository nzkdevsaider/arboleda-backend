import { oak } from "../../deps.ts";

const routes = new oak.Router();

routes.get("/", (ctx) => {
  ctx.response.body = "Hi from main /";
});

export default routes;