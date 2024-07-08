import * as entry from '../../examples/libs/basic/src/entry';
import * as chunk from '../../examples/libs/basic/src/chunk';
import * as module from '../../examples/libs/basic/src/module';

export default async function (t, dir) {
  const results = await t.context.run(dir);
  t.is(results.array.length, 3, results.raw);
  t.deepEqual(results.object['basic.entry'].exports, entry);
  t.deepEqual(results.object['basic.chunk'].exports, chunk);
  t.deepEqual(results.object['basic.module'].exports, module);
}
