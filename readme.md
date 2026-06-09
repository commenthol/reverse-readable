# reverse-readable

A small utility that provides a Readable stream which reads a file from the end
towards the start and emits segments split by a configurable separator. Useful
for reading the last lines of a file (for example logs) in reverse order.

**Status:** lightweight, zero-deps, ESM-first

**Contents**

- **Features**: Read file from end to start, configurable separator, strips separator
- **Usage**: Node.js (ESM) or local import
- **API**: `ReverseReadable` class

**Install**

This repository uses `pnpm` in development, but the module itself has no runtime
dependencies. To install dev dependencies and run tests:

```bash
pnpm install
npm test
```

If you consume the package from a project, install via your package manager:

```bash
# npm
npm install --save reverse-readable
```

## Usage

```js
import { ReverseReadable } from './src/index.js'

const stream = new ReverseReadable({ filename: './logs/app.log' })

stream.on('data', (chunk) => {
  // chunk is a Buffer or string depending on encoding
  console.log('SEGMENT:', chunk.toString())
})

stream.on('end', () => console.log('done'))
stream.on('error', (err) => console.error(err))
```

## Examples

- Print the last N segments (lines) of a file in reverse order by consuming the
  stream and stopping after `N` `data` events.
- Pipe segments into another stream or collect them into an array for further
  processing.

## API

`new ReverseReadable(options)`

- `options.filename` (string) — required. Path to the file to read.
- `options.separator` (string|Buffer, default `"\n"`) — the separator used to
  split segments.
- `options.stripSeparator` (boolean, default `true`) — whether emitted segments
  exclude the separator.
- All other options are forwarded to `stream.Readable` (for example
  `encoding` or `highWaterMark`). Note: `highWaterMark` controls the internal
  chunk size used when reading from the file.

## Behavior notes

- The stream reads the file from the end towards the start (it does not watch
  for appended data). Once the start of the file is reached the stream emits
  any remaining buffered data and ends with `end`.
- Emitted chunks correspond to the bytes after each separator; when
  `stripSeparator` is `false` the separator is included at the beginning of the
  emitted chunk.

## Development

- Source: [src/index.js](src/index.js)
- Types: [types/index.d.ts](types/index.d.ts)
- Tests: [test/index.test.js](test/index.test.js)

Run the test suite with:

```bash
npm test
# or
npm run all
```

## Contributing

Contributions are welcome. Open an issue or a PR describing the proposed
change. Keep changes focused and include tests for new behavior.

## License

MIT licensed
