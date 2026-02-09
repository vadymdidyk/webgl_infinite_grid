import * as THREE from 'three';
import gsap from 'gsap';
import { vertex } from '../shaders/vert';
import { fragment } from '../shaders/frag';

export default class Media {
  constructor(el, gridSize, win, scene, viewSize) {
    this.el = el;
    this.gridSize = gridSize;
    this.win = win;
    this.scene = scene;
    this.viewSize = viewSize;

    this.extraX = 0;
    this.extraY = 0;

    this.imageURL = this.el.getAttribute('src');
    this.imageLoader = new THREE.TextureLoader();

    this.loadImage(() => {
      this.createPlane();
    });
  }

  loadImage(callback) {
    this.imageLoader.load(this.imageURL, texture => {
      this.texture = texture;
      callback && callback();
    });
  }

  createPlane() {
    this.planeGeometry = new THREE.PlaneGeometry(1, 1, 16, 16);
    this.planeMaterial = new THREE.ShaderMaterial({
      side: THREE.DoubleSide,
      vertexShader: vertex,
      fragmentShader: fragment,
      uniforms: {
        uTime: { type: 'f', value: 0 },
        uProgress: { type: 'f', value: 0 },
        uTexture: { type: 't', value: this.texture ? this.texture : 0 },
        uTextureRes: {
          type: 'v2',
          value: new THREE.Vector2(this.texture.image.naturalWidth, this.texture.image.naturalHeight)
        },
        uPlaneSize: { type: 'v2', value: new THREE.Vector2(this.texture.image.width, this.texture.image.height) },
        uScreenRes: { type: 'v2', value: new THREE.Vector2(this.win.width, this.win.height) },
        uViewSize: { type: 'v2', value: new THREE.Vector2(this.viewSize.width, this.viewSize.height) },
        uScaleToViewSize: { type: 'v2', value: new THREE.Vector2(0, 0) },
        uStrength: { type: 'v2', value: new THREE.Vector2(0, 0) },
        uPlaneCenter: { type: 'v2', value: new THREE.Vector2(0, 0) },
        uTouchDown: { type: 'f', value: 0 }
      }
    });

    this.plane = new THREE.Mesh(this.planeGeometry, this.planeMaterial);
    this.setSize(this.win, this.viewSize);
    this.scene.add(this.plane);
  }

  setSize() {
    this.rect = this.el.getBoundingClientRect();

    this.updateScale();
    this.updateX();
    this.updateY();
  }

  updateScale() {
    this.widthViewUnit = (this.rect.width * this.viewSize.width) / this.win.width;
    this.heightViewUnit = (this.rect.height * this.viewSize.height) / this.win.height;

    this.plane.scale.x = this.widthViewUnit;
    this.plane.scale.y = this.heightViewUnit;

    this.planeMaterial.uniforms.uPlaneSize.value.x = this.plane.scale.x;
    this.planeMaterial.uniforms.uPlaneSize.value.y = this.plane.scale.y;

    this.planeMaterial.uniforms.uScaleToViewSize.value.x = (this.viewSize.width) / this.widthViewUnit - 1;
    this.planeMaterial.uniforms.uScaleToViewSize.value.y = this.viewSize.height / this.heightViewUnit - 1;
  }

  updateX(x = 0) {
    this.plane.position.x = (-(this.viewSize.width / 2) + (this.plane.scale.x / 2) + ((this.rect.left - x) / this.win.width) * this.viewSize.width) - this.extraX;
    this.planeMaterial.uniforms.uPlaneCenter.value.x = this.plane.position.x / this.widthViewUnit;
  }

  updateY(y = 0) {
    this.plane.position.y = ((this.viewSize.height / 2) - (this.plane.scale.y / 2) - ((this.rect.top - y) / this.win.height) * this.viewSize.height) - this.extraY;
    this.planeMaterial.uniforms.uPlaneCenter.value.y = this.plane.position.y / this.heightViewUnit;
  }

  handleResize(win, viewSize, gridSize) {
    this.win = win;
    this.viewSize = viewSize;
    this.gridSize = gridSize;
    this.extraX = 0;
    this.extraY = 0;

    if (this.planeMaterial) {
      this.planeMaterial.uniforms.uViewSize.value.x = this.viewSize.width;
      this.planeMaterial.uniforms.uViewSize.value.y = this.viewSize.height;
    }

    if (this.plane) {
      this.setSize();
    }
  }

  handleClose() {
    gsap.to(this.planeMaterial.uniforms.uProgress, 1, {
      value: 0,
      ease: 'power2.out'
    });
  }

  handleClick() {
    gsap.to(this.planeMaterial.uniforms.uProgress, 1.5, {
      value: 1,
      ease: 'power2.inOut'
    });
  }

  handleTouchDown() {
    if (this.planeMaterial) {
      gsap.to(this.planeMaterial.uniforms.uTouchDown, 1, {
        value: 1
      });
    }
  }

  handleTouchUp() {
    if (this.planeMaterial) {
      gsap.to(this.planeMaterial.uniforms.uTouchDown, 1, {
        value: 0
      });
    }
  }

  update(scroll, dirX, dirY) {
    if (!this.plane) return;

    this.planeMaterial.uniforms.uTime.value += 0.1;

    const planeOffset = {
      x: this.plane.scale.x / 2,
      y: this.plane.scale.y / 2
    };

    const viewportOffset = {
      x: this.viewSize.width / 2,
      y: this.viewSize.height / 2
    };

    this.isBeforeY = this.plane.position.y + planeOffset.y < -viewportOffset.y;
    this.isAfterY = this.plane.position.y - planeOffset.y > viewportOffset.y;

    this.isBeforeX = this.plane.position.x + planeOffset.x < -viewportOffset.x;
    this.isAfterX = this.plane.position.x - planeOffset.x > viewportOffset.x;

    if (dirY === 'up' && this.isBeforeY) {
      this.extraY -= this.gridSize.height;
      this.isBeforeY = false;
      this.isAfterY = false;
    }

    if (dirY === 'down' && this.isAfterY) {
      this.extraY += this.gridSize.height;
      this.isBeforeY = false;
      this.isAfterY = false;
    }

    if (dirX === 'down' && this.isBeforeX) {
      this.extraX -= this.gridSize.width;
      this.isBeforeX = false;
      this.isAfterX = false;
    }

    if (dirX === 'up' && this.isAfterX) {
      this.extraX += this.gridSize.width;
      this.isBeforeX = false;
      this.isAfterX = false;
    }

    if (this.planeMaterial) {
      this.planeMaterial.uniforms.uStrength.value.x = ((scroll.current.x - scroll.last.x) / this.win.height) * 10;
      this.planeMaterial.uniforms.uStrength.value.y = ((scroll.current.y - scroll.last.y) / this.win.width) * 10;
    }

    this.updateX(scroll.current.x);
    this.updateY(scroll.current.y);
  }
}