const EMOJI_LIST = "😀😃😄😁😆😅🤣😂🙂🙃😉😊😇🥰😍🤩😘😗😚😙🥲😋😛😜🤪😝🤑🤗🤭🤫🤔🤐🤨😐😑😶😏😒🙄😬🤥😌😔😪🤤😴😷🤒🤕🤢🤮🤧🥵🥶🥴😵🤯🤠🥳🥸😎🤓🧐😕😟🙁😮😯😲😳🥺😦😧😨😰😥😢😭😱😖😣😞😓😩😫🥱😤😡😠🤬😈👿💀💩🤡👹👺👻👽😺😸😹😻😼😽🙀😿"


export function getRandomEmoji(): string {
    const index = Math.floor(Math.random() * (EMOJI_LIST.length / 2))
    return EMOJI_LIST.substring(index * 2, (index * 2) + 2)
}



let topics : string[]|undefined;

export async function getRandomTopic() : Promise<string> {
    if (!topics) {
        topics = await loadTopics();
    }
    return topics[Math.floor(Math.random()*topics.length)]
}

async function loadTopics() : Promise<string[]> {
    const topicsString = await (await fetch("/topics.txt")).text();
    return topicsString.split("\n")
}