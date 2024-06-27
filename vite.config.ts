import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import dotenv from "dotenv";

dotenv.config()

export default defineConfig({
	plugins: [
        sveltekit(),
        process.env.PUBLIC_ADAPTER === "websocket" ? (await import("./src/server/WebsocketServer")).websocketServerPlugin : undefined,
    ]
});
