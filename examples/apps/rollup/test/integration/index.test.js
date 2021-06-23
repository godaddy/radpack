import path from 'path';
import setup from '../../../../../configs/test/integration';
import macro from '../../../../../configs/macros/test-basic';

const test = setup();

test('returns basic exports', macro, path.resolve(__dirname, '..'));
