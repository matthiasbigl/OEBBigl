import { promises as fs } from 'fs';
import { deflateSync } from 'zlib';

const width = 1200;
const height = 630;
const bytesPerPixel = 4;
const rowSize = 1 + width * bytesPerPixel;
const raw = Buffer.alloc(rowSize * height);

const topColor = [15, 23, 42];
const bottomColor = [8, 47, 73];

for (let y = 0; y < height; y += 1) {
	const rowStart = y * rowSize;
	raw[rowStart] = 0; // no filter
	const t = y / (height - 1);
	const baseR = Math.round(topColor[0] * (1 - t) + bottomColor[0] * t);
	const baseG = Math.round(topColor[1] * (1 - t) + bottomColor[1] * t);
	const baseB = Math.round(topColor[2] * (1 - t) + bottomColor[2] * t);

	for (let x = 0; x < width; x += 1) {
		const pixelStart = rowStart + 1 + x * bytesPerPixel;
		const wave = Math.max(0, Math.sin(((x / width) * Math.PI * 6)));
		const accent = Math.max(0, Math.cos(((y / height) * Math.PI * 2)));
		const r = Math.min(255, Math.round(baseR + wave * 25));
		const g = Math.min(255, Math.round(baseG + wave * 35 + accent * 10));
		const b = Math.min(255, Math.round(baseB + wave * 55));
		raw[pixelStart] = r;
		raw[pixelStart + 1] = g;
		raw[pixelStart + 2] = b;
		raw[pixelStart + 3] = 255;
	}
}

const compressed = deflateSync(raw);

const crcTable = (() => {
	const table = new Uint32Array(256);
	for (let n = 0; n < 256; n += 1) {
		let c = n;
		for (let k = 0; k < 8; k += 1) {
			c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
		}
		table[n] = c >>> 0;
	}
	return table;
})();

const crc32 = (buf) => {
	let c = 0xffffffff;
	for (let i = 0; i < buf.length; i += 1) {
		c = crcTable[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
	}
	return (c ^ 0xffffffff) >>> 0;
};

const createChunk = (type, data) => {
	const typeBuf = Buffer.from(type, 'ascii');
	const length = Buffer.alloc(4);
	length.writeUInt32BE(data.length, 0);
	const chunk = Buffer.concat([typeBuf, data]);
	const crc = Buffer.alloc(4);
	crc.writeUInt32BE(crc32(chunk), 0);
	return Buffer.concat([length, typeBuf, data, crc]);
};

const pngSignature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
const ihdrData = Buffer.alloc(13);
ihdrData.writeUInt32BE(width, 0);
ihdrData.writeUInt32BE(height, 4);
ihdrData[8] = 8; // bit depth
// color type 6 (RGBA)
ihdrData[9] = 6;
ihdrData[10] = 0; // compression

ihdrData[11] = 0; // filter
ihdrData[12] = 0; // interlace

const chunks = [
	createChunk('IHDR', ihdrData),
	createChunk('IDAT', compressed),
	createChunk('IEND', Buffer.alloc(0))
];

const pngBuffer = Buffer.concat([pngSignature, ...chunks]);

await fs.mkdir('static', { recursive: true });
await fs.writeFile('static/og-image.png', pngBuffer);

console.log('Generated static/og-image.png (gradient background).');
