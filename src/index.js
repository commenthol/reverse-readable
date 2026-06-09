import fs from 'node:fs'
import { Readable } from 'node:stream'

/**
 * @typedef {object} ReverseReadableStreamOptions
 * @property {string} filename - The name of the file to tail.
 * @property {string|Buffer} [separator='\n'] - The separator.
 * @property {boolean} [stripSeparator=true] - Whether to strip the separator from the output.
 */

export class ReverseReadable extends Readable {
  _buffer = Buffer.alloc(0)
  _chunkSize = 65536
  /** @type {string|Buffer} */
  _separator = '\n'
  _stripSeparator = true
  _filename = ''
  _filesize = 0
  _position = -1
  _encoding = ''
  _fd = undefined

  /**
   * @param {ReverseReadableStreamOptions & import('node:stream').ReadableOptions} options
   */
  constructor(options) {
    const { separator, filename, stripSeparator, ...readableOptions } =
      options || {}
    super(readableOptions)
    this._separator = separator || '\n'
    this._stripSeparator = stripSeparator !== false
    this._encoding = readableOptions.encoding || 'utf8'
    this._chunkSize = readableOptions.highWaterMark || 65536
    this._filename = filename
    if (!this._filename) {
      throw new Error('Filename is required')
    }
  }

  _construct(callback) {
    fs.stat(this._filename, (err, stats) => {
      if (err) {
        callback(err)
        return
      }
      this._filesize = stats.size
      this._position = this._filesize // Start at the end of the file
      fs.open(this._filename, 'r', (err, fd) => {
        if (err) {
          callback(err)
          return
        }
        // @ts-expect-error
        this._fd = fd
        callback()
      })
    })
  }

  _readChunk() {
    if (!this._fd) {
      return Promise.reject(new Error('File descriptor is not available'))
    }

    if (this._position === 0) {
      return Promise.resolve(0)
    }

    let chunkSize = this._chunkSize
    const start = this._position - chunkSize
    if (start < 0) {
      chunkSize = this._position
      this._position = 0
    } else {
      this._position = start
    }
    const buffer = Buffer.alloc(chunkSize)
    return new Promise((resolve, reject) => {
      fs.read(
        // @ts-expect-error
        this._fd,
        buffer,
        0,
        chunkSize,
        this._position,
        (err, bytesRead) => {
          if (err) {
            return reject(err)
          }
          this._buffer = Buffer.concat([
            buffer.subarray(0, bytesRead),
            this._buffer
          ])
          resolve(bytesRead)
        }
      )
    })
  }

  _getSeparatorPositions() {
    const positions = []
    // check if there is a separator in the buffer
    let idx = this._buffer.lastIndexOf(this._separator)
    while (idx !== -1) {
      // find all other separator positions in the buffer
      positions.push(idx)
      if (idx === 0) break
      idx = this._buffer.lastIndexOf(this._separator, idx - 1)
    }
    return positions
  }

  _pushSegments(separatorPositions) {
    if (separatorPositions.length === 0) {
      return true
    }
    // Push lines in reverse order since we are reading backwards
    for (const start of separatorPositions) {
      const line = this._stripSeparator
        ? this._buffer.subarray(start + this._separator.length)
        : this._buffer.subarray(start)
      this._buffer = this._buffer.subarray(0, start)
      if (!this.push(line)) return false
    }
    return true
  }

  async _read() {
    let separatorPositions = []
    try {
      for (;;) {
        const bytesRead = await this._readChunk()
        separatorPositions = this._getSeparatorPositions()
        if (
          separatorPositions.length ||
          bytesRead === 0 ||
          this._position === 0
        )
          break
      }
    } catch (err) {
      this.emit('error', err)
      return
    }
    if (!this._pushSegments(separatorPositions)) {
      return
    }
    if (this._position === 0) {
      if (this._buffer.length > 0) {
        this.push(this._buffer)
      }
      this.push(null) // End of file
    }
  }

  _destroy(err, callback) {
    if (this._fd) {
      fs.close(this._fd, (_err) => callback(_err || err))
    } else {
      callback(err)
    }
  }
}
