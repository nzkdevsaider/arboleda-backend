import { oak } from "../../deps.ts";

const routes = new oak.Router();

routes.get("/", (ctx) => {
  const user = ctx.state.session.get("user");
  if (user) {
    ctx.response.body = `Hi ${user.username} from main /`;
    return;
  }

  ctx.response.body = "Hi from main /";
});

export default routes;
