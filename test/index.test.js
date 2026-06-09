import assert from 'node:assert'
import { Transform, promises } from 'node:stream'
import { ReverseReadable } from '../src/index.js'

describe('ReverseReadable', () => {
  it('shall read empty file', async () => {
    const filename = new URL('./fixtures/empty.txt', import.meta.url)
    const stream = new ReverseReadable({ filename })
    const chunks = []
    await promises.pipeline(
      stream,
      new Transform({
        transform(chunk, encoding, callback) {
          chunks.push(chunk.toString())
          callback()
        }
      })
    )
    assert.deepStrictEqual(chunks, [])
  })

  it('shall read file with empty lines', async () => {
    const filename = new URL('./fixtures/empty-lines.txt', import.meta.url)
    const stream = new ReverseReadable({ filename })
    const chunks = []
    await promises.pipeline(
      stream,
      new Transform({
        transform(chunk, encoding, callback) {
          chunks.push(chunk.toString())
          callback()
        }
      })
    )
    // console.log(chunks)
    assert.deepStrictEqual(chunks, ['7', '4'])
  })

  it('shall read file with empty lines without stripping', async () => {
    const filename = new URL('./fixtures/empty-lines.txt', import.meta.url)
    const stream = new ReverseReadable({ filename, stripSeparator: false })
    const chunks = []
    await promises.pipeline(
      stream,
      new Transform({
        transform(chunk, encoding, callback) {
          chunks.push(chunk.toString())
          callback()
        }
      })
    )
    // console.log(chunks)
    assert.deepStrictEqual(chunks, ['\n7', '\n', '\n', '\n4', '\n', '\n'])
  })

  it('shall read one line', async () => {
    const filename = new URL('./fixtures/one-line.txt', import.meta.url)
    const stream = new ReverseReadable({ filename })
    const chunks = []
    await promises.pipeline(
      stream,
      new Transform({
        transform(chunk, encoding, callback) {
          chunks.push(chunk.toString())
          callback()
        }
      })
    )
    // console.log(chunks)
    assert.deepStrictEqual(chunks, ['One Line'])
  })

  it('shall read multiple lines in small chunks', async () => {
    const filename = new URL('./fixtures/lines.txt', import.meta.url)
    const stream = new ReverseReadable({ filename, highWaterMark: 10 })
    const chunks = []
    await promises.pipeline(
      stream,
      new Transform({
        transform(chunk, encoding, callback) {
          // console.log(chunk.toString())
          chunks.push(chunk.toString())
          callback()
        }
      })
    )
    // console.log(chunks)
    assert.deepStrictEqual(chunks, [
      'Line five',
      'Line four',
      'Line three',
      'Line two',
      'Line one'
    ])
  })

  it('shall read long txt file', async () => {
    const filename = new URL('./fixtures/long.txt', import.meta.url)
    const stream = new ReverseReadable({ filename, stripSeparator: false })
    const chunks = []
    await promises.pipeline(
      stream,
      new Transform({
        transform(chunk, encoding, callback) {
          chunks.push(chunk.toString())
          callback()
        }
      })
    )
    // assert.deepStrictEqual(chunks.length, 997)
    assert.strictEqual(chunks[1], '\nThis is the last line!')
    assert.strictEqual(chunks[996], 'This is the first line!')
  })

  it('shall use different separator', async () => {
    const filename = new URL('./fixtures/separator.txt', import.meta.url)
    const stream = new ReverseReadable({ filename, separator: '||' })
    const chunks = []
    await promises.pipeline(
      stream,
      new Transform({
        transform(chunk, encoding, callback) {
          chunks.push(chunk.toString())
          callback()
        }
      })
    )
    // console.log(chunks)
    assert.deepStrictEqual(chunks, [
      'Line five\n',
      'Line four\n',
      'Line\nthree',
      '\nLine two',
      'Line one'
    ])
  })
})
