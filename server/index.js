const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const cron = require('node-cron');
const cors = require('cors');

const app = express();
app.use(cors()); // Enable CORS for frontend communication
app.use(express.static('uploads')); // Serve static files from the uploads directory

// Custom storage configuration for multer to preserve original file names and extensions
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const originalName = path.parse(file.originalname).name;
        const extension = path.extname(file.originalname);
        cb(null, `${originalName}-${uniqueSuffix}${extension}`);
    }
});

const upload = multer({ storage: storage });

// Store uploaded files
let uploadedFiles = [];

app.post('/upload', upload.array('files'), (req, res) => {
    req.files.forEach(file => {
        uploadedFiles.push({
            filename: file.filename,
            originalName: file.originalname,
            path: file.path
        });
    });

    res.json({ message: 'Files uploaded successfully!', files: uploadedFiles });
});

app.get('/files', (req, res) => {
    res.json(uploadedFiles);
});

// Cron job to clear the uploads folder every 5 minutes
cron.schedule('*/5 * * * *', () => {
    console.log('Clearing uploads folder...');
    
    fs.readdir('uploads/', (err, files) => {
        if (err) throw err;

        for (const file of files) {
            fs.unlink(path.join('uploads', file), err => {
                if (err) throw err;
            });
        }
    });

    // Clear the in-memory uploaded files list
    uploadedFiles = [];
});

app.use(express.static(path.join(__dirname, "../client/build")))

app.get('*', (req, res)=>{
    res.sendFile(path.join(__dirname, "../client/build", "index.html"));
})

app.listen(5000, () => console.log('Server running on http://localhost:5000'));
