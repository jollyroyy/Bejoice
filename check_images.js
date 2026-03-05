import sizeOf from 'image-size';
import fs from 'fs';
const framesDir = 'C:/Users/ASUS/Desktop/Interactive Websit for Bejoice/bejoice-scroll/public/frames';
const files = fs.readdirSync(framesDir).filter(f => f.endsWith('.jpg') || f.endsWith('.png'));
files.slice(0, 10).forEach(f => {
    const dimensions = sizeOf(framesDir + '/' + f);
    console.log(`${f}: ${dimensions.width}x${dimensions.height}`);
});
