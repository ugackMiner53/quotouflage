import dotenv from "dotenv";
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
            adapter,
            paths: {
                // This will be different for you if you don't want your base path to be /quotouflage!
                base: "/quotouflage"
            }
        }
    }
};

export default await config();
