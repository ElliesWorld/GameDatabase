import { Router } from 'express';
import type { Request, Response } from 'express';
import { upload } from './uploadMiddleware.js';
import logger from './logger.js';

const router = Router();

// Upload profile picture endpoint
router.post('/upload/profile-picture', upload.single('profilePicture'), (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    // Return the file path/URL
    const fileUrl = `/uploads/${req.file.filename}`;
    
    logger.info(`Profile picture uploaded: ${req.file.filename}`);
    
    res.status(200).json({
      success: true,
      data: {
        filename: req.file.filename,
        url: fileUrl,
        path: req.file.path
      }
    });
  } catch (error: any) {
    logger.error('Upload error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Upload failed'
    });
  }
});

export default router;