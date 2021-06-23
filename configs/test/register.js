require('@babel/register')({
  extends: './configs/babel/node.js',
  ignore: [
    '/**/node_modules/*',
    '/**/test/unit/*',
    '/**/test/integration/*'
  ],
  cache: false
});
