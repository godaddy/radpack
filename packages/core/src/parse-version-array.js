/*
 TILDE
 0.0.1 = ~0
 0.1.0 = ~0.1
 1.0.0 = ~1
 1.0.1 = ~1
 0.1.2 = ~0.1
 1.2.3 = ~1.2

 CARET
 0.0.1 = ^0
 0.1.0 = ^0
 1.0.0 = ^1
 1.0.1 = ^1
 0.1.2 = ^0
 1.2.3 = ^1
*/
export default array => {
  const [major, minor = 0, patch = 0, release = ''] = array;
  const version = `${ major }.${ minor }.${ patch }${ release }`;
  return {
    major,
    minor,
    patch,
    release,
    version,
    array,
    tilde: `~${ major }${ minor ? `.${ minor }` : '' }`,
    caret: `^${ major }`
  };
};
