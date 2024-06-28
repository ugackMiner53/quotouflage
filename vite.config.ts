import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import dotenv from "dotenv";

dotenv.config()

export default defineConfig(async ({mode}) => {
    console.log("IM DEFINING THE CONFIG I SWEAR " + process.env.PUBLIC_ADAPTER)

    return {
	    plugins: [
            sveltekit(),
            process.env.PUBLIC_ADAPTER === "websocket" ? (await import("./src/server/QuotouflageServerPlugin")).quotouflageServerPlugin(mode) : undefined,
        ]
    }
});
