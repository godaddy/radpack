import * as a from '../../examples/libs/context/src/a/module';
import * as b from '../../examples/libs/context/src/b/module';

export default async function (t, dir) {
  const results = await t.context.run(t.context.resolve(dir));
  t.is(results.array.length, 2, results.raw);
  t.like(results.object['context-a.module'], { exports: a });
  t.like(results.object['context-b.module'], { exports: b });
}
