export type UUID = string & { _uuidBrand : undefined }



export type Player = {
    uuid : UUID;
    host : boolean;
    name : string;
    emoji : string; // Technically should only be one character
}

export type Topic = {
    uuid : UUID;
    about : UUID;
    topic : string;
}

export type Message = {
    topic : UUID;
    author : UUID;
    message : string;
}