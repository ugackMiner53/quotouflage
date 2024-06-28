import type { Plugin, PreviewServerHook, ServerHook } from "vite";

import dotenv from "dotenv";
import QuotouflageServer from "./QuotouflageServer";
dotenv.config();

declare global {
    // eslint-disable-next-line no-var
    var quotouflageServer : QuotouflageServer;
}

let isDevelopment : boolean;

const configureServer : ServerHook & PreviewServerHook = (server) => {
    console.log("THE SERVER, THE SERVER!")
    console.log(global.quotouflageServer);
    if (!global.quotouflageServer) {
        console.log(`Configurating ${isDevelopment ? "development" : "production"} server on ${isDevelopment ? "port 4832" : "default URL"}!`);
        global.quotouflageServer = new QuotouflageServer(server, isDevelopment);
    }
}

export function quotouflageServerPlugin(mode : string) : Plugin {
    console.log("AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA");
    isDevelopment = mode === "development";

    return {
        name: "WebsocketServer",
        configureServer,
        configurePreviewServer: configureServer
    }
}
