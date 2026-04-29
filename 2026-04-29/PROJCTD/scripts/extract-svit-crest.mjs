import fs from "node:fs";
import zlib from "node:zlib";

const input = "frontend/src/assets/svit-logo.png";
const output = "frontend/src/assets/svit-crest-clean.png";

const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
const source = fs.readFileSync(input);

if (!source.subarray(0, 8).equals(signature)) {
  throw new Error("Input is not a PNG file.");
}

let offset = 8;
let width = 0;
let height = 0;
let colorType = 0;
const idatParts = [];

while (offset < source.length) {
  const length = source.readUInt32BE(offset);
  const type = source.subarray(offset + 4, offset + 8).toString("ascii");
  const data = source.subarray(offset + 8, offset + 8 + length);

  if (type === "IHDR") {
    width = data.readUInt32BE(0);
    height = data.readUInt32BE(4);
    colorType = data[9];
  } else if (type === "IDAT") {
    idatParts.push(data);
  } else if (type === "IEND") {
    break;
  }

  offset += length + 12;
}

if (colorType !== 6) {
  throw new Error("Expected RGBA PNG.");
}

const bytesPerPixel = 4;
const stride = width * bytesPerPixel;
const inflated = zlib.inflateSync(Buffer.concat(idatParts));
const pixels = Buffer.alloc(width * height * bytesPerPixel);

let read = 0;
for (let y = 0; y < height; y += 1) {
  const filter = inflated[read];
  read += 1;
  const row = inflated.subarray(read, read + stride);
  const outStart = y * stride;

  for (let x = 0; x < stride; x += 1) {
    const left = x >= bytesPerPixel ? pixels[outStart + x - bytesPerPixel] : 0;
    const up = y > 0 ? pixels[outStart + x - stride] : 0;
    const upLeft = y > 0 && x >= bytesPerPixel ? pixels[outStart + x - stride - bytesPerPixel] : 0;
    let value = row[x];

    if (filter === 1) value = (value + left) & 255;
    if (filter === 2) value = (value + up) & 255;
    if (filter === 3) value = (value + Math.floor((left + up) / 2)) & 255;
    if (filter === 4) value = (value + paeth(left, up, upLeft)) & 255;

    pixels[outStart + x] = value;
  }

  read += stride;
}

const crop = {
  x: 160,
  y: 45,
  width: 1540,
  height: 1540
};

const outPixels = Buffer.alloc(crop.width * crop.height * bytesPerPixel);

for (let y = 0; y < crop.height; y += 1) {
  for (let x = 0; x < crop.width; x += 1) {
    const sourceIndex = ((crop.y + y) * width + crop.x + x) * bytesPerPixel;
    const targetIndex = (y * crop.width + x) * bytesPerPixel;
    const r = pixels[sourceIndex];
    const g = pixels[sourceIndex + 1];
    const b = pixels[sourceIndex + 2];
    const a = pixels[sourceIndex + 3];
    const nearWhite = r > 242 && g > 242 && b > 242;
    const nearBlack = r < 6 && g < 6 && b < 6;
    const atOuterCanvas = nearWhite || nearBlack;

    outPixels[targetIndex] = r;
    outPixels[targetIndex + 1] = g;
    outPixels[targetIndex + 2] = b;
    outPixels[targetIndex + 3] = atOuterCanvas ? 0 : a;
  }
}

const rawRows = Buffer.alloc((crop.width * bytesPerPixel + 1) * crop.height);
let write = 0;
for (let y = 0; y < crop.height; y += 1) {
  rawRows[write] = 0;
  write += 1;
  outPixels.copy(rawRows, write, y * crop.width * bytesPerPixel, (y + 1) * crop.width * bytesPerPixel);
  write += crop.width * bytesPerPixel;
}

const chunks = [
  signature,
  chunk("IHDR", makeIHDR(crop.width, crop.height)),
  chunk("IDAT", zlib.deflateSync(rawRows, { level: 9 })),
  chunk("IEND", Buffer.alloc(0))
];

fs.writeFileSync(output, Buffer.concat(chunks));

function makeIHDR(pngWidth, pngHeight) {
  const buffer = Buffer.alloc(13);
  buffer.writeUInt32BE(pngWidth, 0);
  buffer.writeUInt32BE(pngHeight, 4);
  buffer[8] = 8;
  buffer[9] = 6;
  buffer[10] = 0;
  buffer[11] = 0;
  buffer[12] = 0;
  return buffer;
}

function chunk(type, data) {
  const typeBuffer = Buffer.from(type, "ascii");
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length, 0);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(Buffer.concat([typeBuffer, data])), 0);
  return Buffer.concat([length, typeBuffer, data, crc]);
}

function paeth(a, b, c) {
  const p = a + b - c;
  const pa = Math.abs(p - a);
  const pb = Math.abs(p - b);
  const pc = Math.abs(p - c);
  if (pa <= pb && pa <= pc) return a;
  if (pb <= pc) return b;
  return c;
}

function crc32(buffer) {
  let crc = 0xffffffff;
  for (const byte of buffer) {
    crc ^= byte;
    for (let i = 0; i < 8; i += 1) {
      crc = crc & 1 ? 0xedb88320 ^ (crc >>> 1) : crc >>> 1;
    }
  }
  return (crc ^ 0xffffffff) >>> 0;
}
