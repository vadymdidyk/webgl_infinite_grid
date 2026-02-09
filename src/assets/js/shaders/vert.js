export const vertex = `
	uniform float uTime;
	uniform float uProgress;
	uniform vec2 uStrength;
	uniform vec2 uViewSize;
	uniform vec2 uScaleToViewSize;
	uniform vec2 uPlaneCenter;
	uniform vec2 uPlaneSize;

	varying vec2 vUv;
	varying vec2 vPosition;
	varying vec2 vScale;

	#define PI 3.1415926535897932384626433832795

	void main() {
		vUv = uv;
		vec3 pos = position;
		float waveProgress = uProgress * (1.0 - uProgress);

		pos.x -= uPlaneCenter.x * uProgress;
		pos.y -= uPlaneCenter.y * uProgress;

		vec4 p = modelViewMatrix * vec4(pos, 1.0);

		float d = distance(vUv, vec2(0.5));
		float waveSinusoid = abs(cos(6.0 * (d - uTime * 0.1)));

		float waveStr = (0.4 / (d + 0.4));

		// Scale to win size (w50%, h100%)
		vScale = vec2(1.0 + uScaleToViewSize * uProgress);
		p.xy *= vScale;
		// p.x -= (uViewSize.x / 4.0) * uProgress + 1.0 * waveProgress;
		p.z += 0.1 * uProgress + 0.3 * waveProgress;
		p.z += (waveSinusoid * d) * 1.5 * waveProgress;

		// Bend on drag
		p.z += clamp(abs(sin(p.x / uViewSize.x * PI + PI / 2.0) * uStrength.x * 0.55), 0.0, 0.75);
		p.z += clamp(abs(sin(p.y / uViewSize.y * PI + PI / 2.0) * uStrength.y * 0.55), 0.0, 0.75);

		vPosition = vec2(p.x / uViewSize.x, p.y / uViewSize.y);

		gl_Position = projectionMatrix * p;
	}
`;