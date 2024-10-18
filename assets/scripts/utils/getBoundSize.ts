import { Vec3 } from 'cc';

export function getBoundSize(points: Vec3[]): { x: number, y: number, width: number, height: number } {
	let minX = points[0].x, maxX = points[0].x;
	let minZ = points[0].z, maxZ = points[0].z;

	for (let i = 1; i < points.length; i++) {
		if (points[i].x < minX) minX = points[i].x;
		if (points[i].x > maxX) maxX = points[i].x;
		if (points[i].z < minZ) minZ = points[i].z;
		if (points[i].z > maxZ) maxZ = points[i].z;
	}

	const width = maxX - minX;
	const height = maxZ - minZ;

	return {
		x: minX,
		y: minZ,
		width: width,
		height: height,
	};
}