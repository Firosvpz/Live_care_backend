import multer from "multer";
import path from "path";

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const destPath = path.join(__dirname, "../public/images");
    console.log("Saving file to:", destPath);
    cb(null, destPath);
  },
  filename: (req, file, cb) => {
    const filename = Date.now() + "-" + file.originalname;
    console.log("Generated filename:", filename);
    cb(null, filename);
  },
});

export const uploadStorage = multer({ storage: storage });
