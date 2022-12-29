import { oak, postgres, dotenv, snowflake } from "../../deps.ts";
import { error, success } from "../../utils/logger.ts";

const routes = new oak.Router();
const flakes = new snowflake.default();
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
  const id = flakes.generate();

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

  const checkUsername = await client.queryArray(
    "SELECT * FROM users_accounts WHERE username = $1",
    { 1: params.username }
  );

  if (checkUsername.rows.length > 0) {
    ctx.response.status = 401;
    ctx.response.body = error(
      `El nombre de usuario "${params.username}" ya está en uso.`
    );
    return;
  }

  await client.queryArray(
    "INSERT INTO users_accounts (id, username, password) VALUES ($1, $2, $3)",
    {
      1: id,
      2: params.username,
      3: params.password,
    }
  );

  const result = await client.queryObject(
    "INSERT INTO users (id, username) VALUES ($1, $2) RETURNING *",
    {
      1: id,
      2: params.username,
    }
  );

  ctx.response.status = 200;
  ctx.response.body = success(result.rows[0]);
  await client.end();
});

export default routes;
