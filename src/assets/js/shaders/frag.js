export const fragment = `
  uniform float uTime;
  uniform float uProgress;
  uniform sampler2D uTexture;
  uniform vec2 uTextureRes;
  uniform vec2 uPlaneSize;
  uniform vec2 uScreenRes;
  uniform float uTouchDown;

  varying vec2 vUv;
  varying vec2 vPosition;
  varying vec2 vScale;

  vec2 preserveAspectRatio(vec2 uv, vec2 planeSize, vec2 imageSize ) {
    vec2 ratio = vec2(
      min((planeSize.x / planeSize.y) / (imageSize.x / imageSize.y), 1.0),
      min((planeSize.y / planeSize.x) / (imageSize.y / imageSize.x), 1.0)
    );

    vec2 sliceUvs = vec2(
      uv.x * ratio.x + (1.0 - ratio.x) * 0.5,
      uv.y * ratio.y + (1.0 - ratio.y) * 0.5
    );

    return sliceUvs;
  }

  void main() {
    vec2 scaledPlaneSize = uPlaneSize * vScale;
    vec2 smallImageUV = preserveAspectRatio(vUv, scaledPlaneSize, uTextureRes);
    smallImageUV = (smallImageUV - 0.5) * (0.8 + 0.2 * uProgress) + 0.5;
    float xDisplacement = vPosition.x * 0.2 * (1.0 - uProgress);
    float yDisplacement = vPosition.y * 0.2 * (1.0 - uProgress);

    vec3 imageColor = texture2D(uTexture, vec2(smallImageUV.x + xDisplacement, smallImageUV.y + yDisplacement)).rgb;

    if (uProgress > 0.0) {
      vec2 bigImageUV = preserveAspectRatio(vUv, scaledPlaneSize, uTextureRes);
      bigImageUV = (bigImageUV - 0.5) * (0.8 + 0.2 * uProgress) + 0.5;
      vec3 bigImageColor = texture2D(uTexture, vec2(bigImageUV.x + xDisplacement, bigImageUV.y + yDisplacement)).rgb;

      imageColor = mix(imageColor, bigImageColor, uProgress);
    }

    gl_FragColor = vec4(imageColor, 1.0);
  }
`;
