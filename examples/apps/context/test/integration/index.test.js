import path from 'path';
import setup from '../../../../../configs/test/integration';
import macro from '../../../../../configs/macros/test-context';

const test = setup();

test('returns context exports', macro, path.resolve(__dirname, '..'));
