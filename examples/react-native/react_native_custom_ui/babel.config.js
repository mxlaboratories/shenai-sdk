function inlineShenaiApiKey({types: t}) {
  return {
    visitor: {
      MemberExpression(path) {
        if (path.matchesPattern("process.env.SHENAI_API_KEY")) {
          path.replaceWith(
            t.stringLiteral(process.env.SHENAI_API_KEY ?? ""),
          );
        }
      },
    },
  };
}

module.exports = api => {
  api.cache.using(() => process.env.SHENAI_API_KEY ?? "");

  return {
    presets: ["module:@react-native/babel-preset"],
    plugins: [inlineShenaiApiKey],
  };
};
