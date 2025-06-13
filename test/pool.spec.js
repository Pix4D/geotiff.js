import * as chai from 'chai';

import chaiAsPromised from 'chai-as-promised';

import Worker from 'web-worker';
import Pool from '../src/pool.js';
import create from '../src/worker/create.js';

chai.use(chaiAsPromised);

const { expect } = chai;

describe('Pool', () => {
  it('shall decode a buffer with a worker', async () => {
    const pool = new Pool(1, create);
    const buffer = new ArrayBuffer(1);
    (new Uint8Array(buffer)).set([0]);
    const fileDirectory = { Compression: 1 };
    const decoded = await pool.decode(fileDirectory, buffer);
    const decodedArray = new Uint8Array(decoded);
    expect(decodedArray).to.eql(new Uint8Array([0]));
    pool.destroy();
  });

  it('shall properly propagate an exception', async () => {
    const pool = new Pool(1, () => {
      return new Worker(new URL('../src/worker/decoder.js', import.meta.url), {
        type: 'module',
      });
    });
    const buffer = new ArrayBuffer(1);
    (new Uint8Array(buffer)).set([0]);
    const fileDirectory = { Compression: -1 };

    await expect(pool.decode(fileDirectory, buffer)).to.eventually.be.rejected;
    pool.destroy();
  });
});
