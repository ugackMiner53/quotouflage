export type UUID = string & { _uuidBrand : undefined }



export type Player = {
    uuid : UUID;
    name : string;
    emoji : string; // Technically should only be one character
}

export type Topic = {
    uuid : UUID;
    about : UUID;
    judge : UUID;
    topic : string;
}

export type Message = {
    topic : UUID;
    author : UUID;
    message : string;
}