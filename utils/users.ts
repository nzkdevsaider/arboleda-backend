import { postgres, dotenv } from "./../deps.ts";
const connectedClients = new Map();

const client = new postgres.Client({
  user: dotenv.config().DB_USER,
  password: dotenv.config().DB_PASS,
  database: dotenv.config().DB_NAME,
  hostname: dotenv.config().DB_HOST,
  port: 5432,
});

async function userJoin(socket: WebSocket, userId: string) {
  await client.connect();
  const user = { socket, userId };
  const checkIsOnline = await client.queryArray(
    "SELECT * FROM users_sessions WHERE userid = $1",
    { 1: user.userId }
  );

  if (checkIsOnline.rows.length > 0) {
    await client.queryObject(
      "UPDATE users_sessions SET socketid = $1 WHERE userid = $2",
      { 1: user.socket.id, 2: user.userId }
    );
    console.log("El usuario ya estaba en línea, actualizando socket...");
    await client.end();
    return;
  }

  await client.queryObject(
    "INSERT INTO users_sessions (socketid, userid) VALUES ($1, $2)",
    { 1: user.socket.id, 2: user.userId }
  );

  connectedClients.set(user.userId, socket);

  await client.end();
  return;
}

async function userLeave(socket: WebSocket) {
  await client.connect();
  const checkIsOnline = await client.queryArray(
    "SELECT * FROM users_sessions WHERE socketid = $1",
    { 1: socket.id }
  );

  if (checkIsOnline.rows.length === 0) {
    await client.end();
    return;
  }

  await client.queryObject("DELETE FROM users_sessions WHERE socketid = $1", {
    1: socket.id,
  });
  connectedClients.delete(socket.userId);

  await client.end();
}

function broadcast(message) {
  console.log(message);
  for (const sockets of connectedClients.values()) {
    sockets.send(message);
  }
}

export { userJoin, userLeave, broadcast };
