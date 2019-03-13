const presets = ['@babel/env'];
const plugins = [];
if (process.env["ENV"] === "test") {
  plugins.push('istanbul');
  plugins.push('rewire');
}
module.exports = {
    presets,
    plugins,
};
