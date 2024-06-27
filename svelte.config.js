import dotenv from "dotenv";

// import adapter from '@sveltejs/adapter-static';
// import adapter from '@sveltejs/adapter-node';
// import type { Adapter } from '@sveltejs/kit';

import { vitePreprocess } from '@sveltejs/vite-plugin-svelte'

dotenv.config();

// /** @type {import('@sveltejs/kit').Config} */
const config = async() => {

    const adapter = process.env.PUBLIC_ADAPTER === "trystero" 
        ? (await import("@sveltejs/adapter-static")).default()
        : (await import("@sveltejs/adapter-node")).default();

    return {
        // Consult https://kit.svelte.dev/docs/integrations#preprocessors
        // for more information about preprocessors
        preprocess: vitePreprocess(),
    
        kit: {
            adapter
        }
    }
};

export default config();
