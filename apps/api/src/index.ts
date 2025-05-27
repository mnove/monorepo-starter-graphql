import { createServer } from "./server";
import { log } from "@repo/logger";

const port = process.env.PORT || 5001;
const server = createServer();

server.listen(port, () => {
  log(`api running on ${port}`);
});
