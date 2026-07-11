import app, { setupWebSocketProxy } from "./src/app.js";

const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => {
    console.log(`Router is running on port ${PORT}`);
});

setupWebSocketProxy(server);
