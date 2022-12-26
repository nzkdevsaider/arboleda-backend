import { oak, postgres, dotenv } from "../../deps.ts";

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

  const body = await ctx.request.body({ type: "form-data" });
  const params = await body.value.read();

  // Buscar el codigo de invitación en la base de datos
  const result = await client.queryArray(
    "SELECT * FROM invites WHERE invitecode = $1",
    { 1: params.fields.invitecode }
  );

  // Si no existe el usuario o la contraseña es incorrecta
  if (result.rows.length === 0) {
    ctx.response.status = 401;
    ctx.response.body = "Código de invitación válido";
    return;
  }

  // Si existe el usuario y la contraseña es correcta
  ctx.response.status = 200;
  ctx.response.body = "Código de invitación válido";
});

export default routes;
