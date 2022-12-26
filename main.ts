import { oak, dotenv } from "./deps.ts";
import login from "./routes/login/login.ts";
import register from "./routes/register/register.ts";
import main from "./routes/main/main.ts";
import ws from "./routes/ws/ws.ts";

const app = new oak.Application();
const router = new oak.Router();

router.get("/", main.routes());
router.get("/login", login.routes());
router.get("/register", register.routes());
router.get("/ws", ws.routes());

app.use(router.routes());
app.use(router.allowedMethods());

// Servidor HTTP escuchando
app.addEventListener("listen", ({ port }) => {
  console.log(`SERVER on ${port}`);
});

await app.listen({ port: Number(dotenv.config().HTTP_PORT) });