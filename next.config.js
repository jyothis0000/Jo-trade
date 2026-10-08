const fs = require("fs");

// antd 4 and its rc-* deps ship ESM without file extensions; Next must transpile them for Node SSR.
const rc = fs.readdirSync("node_modules").filter((d) => d.startsWith("rc-"));

module.exports = {
  transpilePackages: ["antd", "@ant-design/icons", "@ant-design/icons-svg", ...rc],
  webpack(config, { isServer }) {
    if (isServer) config.externals.push("mongodb"); // load the driver natively, not bundled
    return config;
  },
};
