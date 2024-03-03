const fs = require("fs")
const path = require("path")
const {compileFromFile} = require("json-schema-to-typescript")

const rootDir = "./"

function processDir(dir) {
  fs.readdirSync(dir).forEach(async (file) => {
    const filePath = path.join(dir, file)
    const stat = fs.statSync(filePath)

    if (stat.isDirectory() && file !== "node_modules" && file !== ".git") {
      processDir(filePath)
    } else if (path.extname(file) === ".json" && file.endsWith("-schema.json")) {
      console.info("Processing", filePath)
      const tsFile = file.replace(".json", ".d.ts")
      const ts = await compileFromFile(filePath)
      if (ts) {
        const genDir = path.join(dir, "gen")
        if (!fs.existsSync(genDir)) {
          fs.mkdirSync(genDir)
        }
        fs.writeFileSync(path.join(genDir, tsFile), ts)
      }
    }
  })
}

processDir(rootDir)
