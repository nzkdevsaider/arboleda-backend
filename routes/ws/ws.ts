import { oak, faker } from "../../deps.ts";

const routes = new oak.Router();
const connectedClients = new Map();

function broadcast(message) {
  for (const client of connectedClients.values()) {
    client.send(message);
  }
}

function broadcast_usernames() {
  const usernames = [...connectedClients.keys()];
  console.log(
    "Enviando lista de usuarios a todos los usuarios: " + JSON.stringify(usernames)
  );
  broadcast(
    JSON.stringify({
      event: "update-users",
      usernames: usernames,
    })
  );
}

routes.get("/chat", async (ctx) => {
  const socket = await ctx.upgrade();
  //const username = ctx.request.url.searchParams.get("username");
  const username = faker.name.findName();

  if (connectedClients.has(username)) {
    socket.close(1008, `El usuario ${username} ya existe.`);
    return;
  }
  socket.username = username;
  connectedClients.set(username, socket);
  console.log(`Se ha conectado: ${username}`);

  socket.onopen = () => {
    broadcast_usernames();
  };

  socket.onclose = () => {
    console.log(`Se ha desconectado: ${socket.username}`);
    connectedClients.delete(socket.username);
    broadcast_usernames();
  };

  // Mensaje
  socket.onmessage = (m) => {
    const data = JSON.parse(m.data);
    switch (data.event) {
      /* 
        {
            "event": "send-message",
            "message": "Hola"
        }
        */

      case "send-message":
        broadcast(
          JSON.stringify({
            event: "send-message",
            message: data.message,
            user: {
              username: socket.username,
            },
          })
        );
        break;
    }
  };
});

export default routes;
