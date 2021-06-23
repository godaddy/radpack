import Radpack from './radpack';

const radpack = new Radpack();

globalThis.define = radpack.define.bind(radpack);

export default radpack;
