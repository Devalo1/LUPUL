/**
 * Image optimization script
 * 
 * This script optimizes images in the public directory using sharp
 * It generates different sizes and formats for responsive images
 */

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const glob = require('glob');

// Configuration
const INPUT_DIR = path.join(__dirname, '../public/images');
const OUTPUT_DIR = path.join(__dirname, '../public/images/optimized');
const SIZES = [320, 640, 1024, 1920];
const FORMATS = ['avif', 'webp', 'jpeg'];
const QUALITY = 80;

// Create output directory if it doesn't exist
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// Get all images in the input directory
const imageFiles = glob.sync(path.join(INPUT_DIR, '**/*.{jpg,jpeg,png,gif}'), { nodir: true });

console.log(`Found ${imageFiles.length} image files to optimize`);

// Process each image
async function processImages() {
  for (const inputFile of imageFiles) {
    try {
      const filename = path.basename(inputFile, path.extname(inputFile));
      console.log(`Processing ${filename}...`);

      const image = sharp(inputFile);
      const metadata = await image.metadata();

      for (const size of SIZES) {
        // Skip if original is smaller than target size
        if (metadata.width < size) continue;

        for (const format of FORMATS) {
          const outputFilename = `${filename}-${size}.${format}`;
          const outputPath = path.join(OUTPUT_DIR, outputFilename);

          await image
            .resize(size)
            [format]({
              quality: QUALITY
            })
            .toFile(outputPath);

          console.log(`Generated ${outputFilename}`);
        }
      }
    } catch (error) {
      console.error(`Error processing ${inputFile}:`, error);
    }
  }
}

// Execute the function
processImages()
  .then(() => console.log('Image optimization completed'))
  .catch(err => console.error('Error during image optimization:', err));
