import { oak, postgres, dotenv, snowflake } from "../../deps.ts";

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

  const body = await ctx.request.body({ type: "form-data" });
  const params = await body.value.read();

  if (
    params.fields.username === "" ||
    params.fields.password === "" ||
    !params.fields.username ||
    !params.fields.password
  ) {
    ctx.response.status = 401;
    ctx.response.body = "Los campos 'username' y 'password' son obligatorios.";
    return;
  }

  const checkUsername = await client.queryArray(
    "SELECT * FROM users WHERE username = $1",
    { 1: params.fields.username }
  );

  if (checkUsername.rows.length > 0) {
    ctx.response.status = 401;
    ctx.response.body = "El usuario ya existe";
    return;
  }

  await client.queryArray(
    "INSERT INTO users (username, password, id) VALUES ($1, $2, $3)",
    {
      1: params.fields.username,
      2: params.fields.password,
      3: flakes.generate(),
    }
  );

  ctx.response.status = 200;
  ctx.response.body = "Usuario registrado";
});

export default routes;
