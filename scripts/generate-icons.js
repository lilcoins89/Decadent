import fs from 'fs';
import zlib from 'zlib';

function createPNG(width, height, r, g, b, innerR, innerG, innerB) {
  // Construct a minimal uncompressed/deflated valid PNG
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR chunk
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8; // bit depth
  ihdrData[9] = 6; // color type RGBA
  ihdrData[10] = 0; // compression
  ihdrData[11] = 0; // filter
  ihdrData[12] = 0; // interlace
  const ihdr = makeChunk('IHDR', ihdrData);

  // Raw image data with filter byte per scanline
  const rowLength = 1 + width * 4;
  const rawData = Buffer.alloc(rowLength * height);

  const cx = width / 2;
  const cy = height / 2;
  const radius = width * 0.42;
  const innerRadius = width * 0.25;

  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowLength;
    rawData[rowOffset] = 0; // Filter type 0 (None)
    for (let x = 0; x < width; x++) {
      const pxOffset = rowOffset + 1 + x * 4;
      const dx = x - cx;
      const dy = y - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < innerRadius) {
        // Inner core (bright cyan/white)
        rawData[pxOffset] = innerR;
        rawData[pxOffset + 1] = innerG;
        rawData[pxOffset + 2] = innerB;
        rawData[pxOffset + 3] = 255;
      } else if (dist < radius) {
        // Outer shield circle (Trust blue)
        const t = (dist - innerRadius) / (radius - innerRadius);
        rawData[pxOffset] = Math.round(r * (1 - t * 0.4));
        rawData[pxOffset + 1] = Math.round(g * (1 - t * 0.2));
        rawData[pxOffset + 2] = Math.round(b);
        rawData[pxOffset + 3] = 255;
      } else {
        // Background dark obsidian
        rawData[pxOffset] = 10;
        rawData[pxOffset + 1] = 14;
        rawData[pxOffset + 2] = 24;
        rawData[pxOffset + 3] = 255;
      }
    }
  }

  const deflated = zlib.deflateSync(rawData);
  const idat = makeChunk('IDAT', deflated);
  const iend = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdr, idat, iend]);
}

function makeChunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const typeBuf = Buffer.from(type, 'ascii');
  const crcInput = Buffer.concat([typeBuf, data]);
  const crc = crc32(crcInput);
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc, 0);
  return Buffer.concat([len, typeBuf, data, crcBuf]);
}

// Simple CRC32 table
const crcTable = new Uint32Array(256);
for (let i = 0; i < 256; i++) {
  let c = i;
  for (let k = 0; k < 8; k++) {
    c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  }
  crcTable[i] = c;
}

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    c = crcTable[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  }
  return (c ^ 0xffffffff) >>> 0;
}

if (!fs.existsSync('public')) {
  fs.mkdirSync('public', { recursive: true });
}

// Generate PWA icons
fs.writeFileSync('public/pwa-192x192.png', createPNG(192, 192, 5, 82, 255, 0, 245, 160));
fs.writeFileSync('public/pwa-512x512.png', createPNG(512, 512, 5, 82, 255, 0, 245, 160));
fs.writeFileSync('public/pwa-maskable-512x512.png', createPNG(512, 512, 0, 82, 255, 255, 255, 255));
fs.writeFileSync('public/apple-touch-icon.png', createPNG(180, 180, 5, 82, 255, 0, 245, 160));
fs.writeFileSync('public/favicon.ico', createPNG(32, 32, 5, 82, 255, 0, 245, 160));

console.log('Successfully generated PWA icon assets in public/');
