 const express = require('express');
const multer = require('multer');
const ExifParser = require('exif-parser');
const exifr = require('exifr');
const PNG = require('pngjs').PNG;
const cors = require('cors');

const app = express();
const port = 4000;

app.use(cors());

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

app.post('/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const fileBuffer = req.file.buffer;

    let metadata;

    if (isJPEG(fileBuffer)) {
      console.log("JPEG")
      const exifParser = ExifParser.create(fileBuffer);
      const result = exifParser.parse();
      metadata = result.tags;
      console.log(metadata)
    } else if (isPNG(fileBuffer)) {
      metadata = await exifr.parse(fileBuffer);
    } else {
      return res.status(400).json({ error: 'Unsupported file format' });
    }
    
    res.json({ metadata });
  } catch (error) {
    console.error('Error processing file:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

function isJPEG(buffer) {
console.log(">>>>>")
  return buffer[0] === 0xff && buffer[1] === 0xd8;
}

function isPNG(buffer) {
  return buffer[0] === 0x89 && buffer.toString('utf8', 1, 4) === 'PNG';
}

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

