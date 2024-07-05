export type UUID = string & { _uuidBrand : undefined }
export type NetworkID = string & { _networkIdBrand : undefined }

export type Player = {
    networkId : NetworkID;
    name : string;
    emoji : string; // Technically should only be one character
    score : number;
}

export type Topic = {
    uuid : UUID;
    about : NetworkID;
    judge : NetworkID;
    topic : string;
}

export type Message = {
    topic : UUID;
    author : NetworkID;
    message : string;
}