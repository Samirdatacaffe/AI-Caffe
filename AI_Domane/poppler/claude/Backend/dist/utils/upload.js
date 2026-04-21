import multer from 'multer';
import crypto from 'crypto';
import path from 'path';
import fs from 'fs';
const UPLOAD_DIR = path.join(process.cwd(), 'uploads');
// Ensure uploads directory exists
fs.mkdirSync(UPLOAD_DIR, { recursive: true });
const storage = multer.diskStorage({
    destination: (_req, _file, cb) => {
        cb(null, UPLOAD_DIR);
    },
    filename: (_req, file, cb) => {
        const ext = path.extname(file.originalname);
        const name = `${crypto.randomUUID()}${ext}`;
        cb(null, name);
    },
});
const ALLOWED_EXTENSIONS = [
    '.pdf', '.docx', '.xlsx', '.xls', '.csv', '.txt', '.json',
    '.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg',
    '.zip', '.doc', '.pptx', '.ppt', '.md',
];
const fileFilter = (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (ALLOWED_EXTENSIONS.includes(ext)) {
        cb(null, true);
    }
    else {
        cb(new Error(`File type ${ext} is not supported`));
    }
};
const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
});
export default upload;
