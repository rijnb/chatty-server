module.exports = {
  printWidth: 120,
  tabWidth: 2,
  useTabs: false,
  semi: false,
  singleQuote: false,
  jsxSingleQuote: false,
  trailingComma: "none",
  bracketSpacing: false,
  bracketSameLine: false,
  jsxBracketSameLine: false,
  arrowFunctionParentheses: "always",
  arrowParens: "always",
  htmlWhitespaceSensitivity: "css",
  insertPragma: false,
  proseWrap: "preserve",
  quoteProps: "as-needed",
  plugins: ["@trivago/prettier-plugin-sort-imports", "prettier-plugin-tailwindcss"],
  importOrder: [
    "^[@A-Za-z][^./]", // Non-project import.
    "^(@|[.]+)/" // Project imports.
  ],
  importOrderSeparation: true,
  importOrderSortSpecifiers: true
}

