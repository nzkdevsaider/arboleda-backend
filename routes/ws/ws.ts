import { oak, snowflake, momentjs } from "../../deps.ts";
import { userJoin, userLeave, broadcast } from "../../utils/users.ts";

const flakes = new snowflake.default();
const routes = new oak.Router();
const moment = momentjs.default;
moment.locale("es");

routes.get("/", async (ctx) => {
  const socket = await ctx.upgrade();
  const user = (await ctx.state.session.get("user")) || "";
  const socketId = flakes.generate();

  if (!user) {
    socket.close();
    console.log("El usuario no está logueado, se cierra la conexión.");
    return;
  }

  socket.id = socketId;
  socket.userId = user.id;

  socket.onopen = () => {
    console.log(`${user.username} conectado al socket ${socket.id}`);
    userJoin(socket, user.id);
  };

  socket.onclose = () => {
    console.log(`${user.username} desconectado del socket ${socket.id}`);
    userLeave(socket);
  };

  socket.onmessage = (m) => {
    const data = JSON.parse(m.data);
    console.log(data);
    switch (data.event) {
      case "send-message":
        broadcast(
          JSON.stringify({
            event: "send-message",
            user,
            messageData: {
              message: data.message,
              createAt: moment(),
            },
          })
        );
        break;
    }
  };
});

export default routes;
