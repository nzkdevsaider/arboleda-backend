import { oak } from "../../deps.ts";

const routes = new oak.Router();

routes.post("/", async (ctx) => {
  await ctx.state.session.deleteSession();
  ctx.response.redirect("/");
});

export default routes;