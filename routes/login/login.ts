import { oak, postgres, dotenv } from "../../deps.ts";
import { error, success } from "../../utils/logger.ts";

const routes = new oak.Router();
const client = new postgres.Client({
  user: dotenv.config().DB_USER,
  password: dotenv.config().DB_PASS,
  database: dotenv.config().DB_NAME,
  hostname: dotenv.config().DB_HOST,
  port: 5432,
});

routes.post("/", async (ctx) => {
  await client.connect();

  const body = await ctx.request.body({ type: "json" });
  const params = await body.value;

  // Verificar si los campos están vacios o faltan campos requeridos.
  if (
    params.username === "" ||
    params.password === "" ||
    !params.username ||
    !params.password
  ) {
    ctx.response.status = 401;
    ctx.response.body = error(
      `Los campos "username" y "password" son requeridos.`
    );
    return;
  }

  const result = await client.queryObject(
    "SELECT * FROM users_accounts WHERE username = $1 AND password = $2",
    {
      1: params.username,
      2: params.password,
    }
  );

  if (result.rows.length === 0) {
    ctx.response.status = 401;
    ctx.response.body = error(`Usuario o contraseña incorrectos.`);
    return;
  }

  const user = await client.queryObject("SELECT * FROM users WHERE id = $1", {
    1: result.rows[0].id,
  });

  ctx.response.status = 200;
  ctx.state.session.set("user", user.rows[0]);
  ctx.response.body = success(user.rows[0]);
  await client.end();
});

export default routes;
