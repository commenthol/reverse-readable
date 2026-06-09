/**
 * @typedef {object} ReverseReadableStreamOptions
 * @property {string} filename - The name of the file to tail.
 * @property {string|Buffer} [separator='\n'] - The separator.
 * @property {boolean} [stripSeparator=true] - Whether to strip the separator from the output.
 */
export class ReverseReadable extends Readable {
    /**
     * @param {ReverseReadableStreamOptions & import('node:stream').ReadableOptions} options
     */
    constructor(options: ReverseReadableStreamOptions & import("node:stream").ReadableOptions);
    _buffer: Buffer<ArrayBuffer>;
    _chunkSize: number;
    /** @type {string|Buffer} */
    _separator: string | Buffer;
    _stripSeparator: boolean;
    _filename: string;
    _filesize: number;
    _position: number;
    _encoding: string;
    _fd: undefined;
    _construct(callback: any): void;
    _readChunk(): Promise<any>;
    _getSeparatorPositions(): number[];
    _pushSegments(separatorPositions: any): boolean;
    _read(): Promise<void>;
    _destroy(err: any, callback: any): void;
}
export type ReverseReadableStreamOptions = {
    /**
     * - The name of the file to tail.
     */
    filename: string;
    /**
     * - The separator.
     */
    separator?: string | Buffer<ArrayBufferLike> | undefined;
    /**
     * - Whether to strip the separator from the output.
     */
    stripSeparator?: boolean | undefined;
};
import { Readable } from 'node:stream';
