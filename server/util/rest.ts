export interface RestBody {}

export interface RestRequest {}

export enum RestStatus {
    SUCCESS           = 'SUCCESS',
    MALFORMED_REQUEST = 'MALFORMED_REQUEST',
    SERVER_ERROR      = 'SERVER_ERROR'
}

export interface RestResponse extends RestBody {
    status: RestStatus;
}

export interface RestErrorResponse extends RestResponse {
    message: string;
}