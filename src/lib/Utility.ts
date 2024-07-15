import type { UUID } from "./Types";
import { v4 as uuidv4 } from "uuid";

const EMOJI_LIST = "😀😃😄😁😆😅🤣😂🙂🙃😉😊😇🥰😍🤩😘😗😚😙🥲😋😛😜🤪😝🤑🤗🤭🤫🤔🤐🤨😐😑😶😏😒🙄😬🤥😌😔😪🤤😴😷🤒🤕🤢🤮🤧🥵🥶🥴😵🤯🤠🥳🥸😎🤓🧐😕😟🙁😮😯😲😳🥺😦😧😨😰😥😢😭😱😖😣😞😓😩😫🥱😤😡😠🤬😈👿💀💩🤡👹👺👻👽😺😸😹😻😼😽🙀😿"


export function getRandomEmoji(): string {
    const index = Math.floor(Math.random() * (EMOJI_LIST.length / 2))
    return EMOJI_LIST.substring(index * 2, (index * 2) + 2)
}



export let topics : string[]|undefined;

export async function getRandomTopic() : Promise<string> {
    if (!topics) {
        topics = await loadTopics();
    }
    return topics[Math.floor(Math.random()*topics.length)]
}

export function updateTopics(newTopics : string[]) {
    topics = newTopics;
}

async function loadTopics() : Promise<string[]> {
    const topicsString = await (await fetch("/topics.txt")).text();
    return topicsString.split("\n")
}

export function getRandomUUID() : UUID {
    if (crypto.randomUUID) {
        return <UUID>crypto.randomUUID();
    } else {
        return <UUID>uuidv4();
    }
}