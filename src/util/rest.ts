export interface RestBody {}

export interface RestRequest {}

export enum RestStatus {
    UNKNOWN           = 'UNKNOWN',
    SUCCESS           = 'SUCCESS',
    FAILURE           = 'FAILURE',
    MALFORMED_REQUEST = 'MALFORMED_REQUEST',
    SERVER_ERROR      = 'SERVER_ERROR'
}

export interface RestResponse extends RestBody {
    status: RestStatus;
}

export interface RestErrorResponse extends RestResponse {
    message: string;
}