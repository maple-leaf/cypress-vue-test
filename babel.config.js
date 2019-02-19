const presets = ['@babel/env'];
const plugins = [];
if (process.env["ENV"] === "test") {
  plugins.push('istanbul');
}
module.exports = {
    presets,
    plugins,
};
