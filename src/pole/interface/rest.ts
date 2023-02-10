export interface RestBody {}

export interface RestRequest {}

export enum RestStatus {
    UNKNOWN           = 'UNKNOWN',
    SUCCESS           = 'SUCCESS',
    FAILURE           = 'FAILURE',
    
    SERVER_ERROR      = 'SERVER_ERROR',

    MALFORMED_REQUEST = 'MALFORMED_REQUEST',
    INVALID_REQUEST   = 'INVALID_REQUEST'
}

export interface RestResponse extends RestBody {
    status: RestStatus;
}