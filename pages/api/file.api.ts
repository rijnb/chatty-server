import fs from "fs"
import {NextApiRequest, NextApiResponse} from "next"
import path from "path"

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const {filename} = req.query
  if (typeof filename !== "string" || filename?.trim().length === 0 || path.basename(filename).length === 0) {
    res.status(400).json({error: "Invalid filename"})
    return
  }

  const filePath = path.join(process.cwd() + "/public", path.basename(filename))
  if (fs.existsSync(filePath)) {
    res.status(200).json({exists: true})
  } else {
    res.status(200).json({exists: false})
  }
}

export default handler
