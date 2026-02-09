import * as THREE from 'three';
import gsap from 'gsap';
import Utils from '../Utils';
import Media from './Media';

export default class WebGLGrid {
	constructor() {
		this.win = {
			canvas: document.querySelector('#c'),
			width: window.innerWidth,
			height: window.innerHeight,
			aspectRatio: window.innerWidth / window.innerHeight
		};

		this.scroll = {
			current: { x: 0, y: 0 },
			last: { x: 0, y: 0 },
			target: { x: 0, y: 0 },
			position: { x: 0, y: 0 }
		};

		this.mouse = new THREE.Vector2();
		this.currentID = -1;
		this.canDrag = true;

		this.animate = this.animate.bind(this);
		this.getViewSize = this.getViewSize.bind(this);
	}

	init() {
		this.initCamera();
		this.initScene();
		this.initRenderer();
		this.initRaycaster();

		this.initGrid();
		this.initContent();
		this.initImages();

		this.bindEvents();
		this.animate();
	}

	bindEvents() {
		window.addEventListener('resize', this.onResize.bind(this));
		this.win.canvas.addEventListener('wheel', this.onWheel.bind(this));
		this.win.canvas.addEventListener('mousedown', this.onTouchDown.bind(this))
		this.win.canvas.addEventListener('mousemove', this.onTouchMove.bind(this))
		this.win.canvas.addEventListener('mouseup', this.onTouchUp.bind(this))
		this.win.canvas.addEventListener('touchstart', this.onTouchDown.bind(this))
		this.win.canvas.addEventListener('touchmove', this.onTouchMove.bind(this))
		this.win.canvas.addEventListener('touchend', this.onTouchUp.bind(this))
	}

	getViewSize() {
		const distance = this.camera.position.z;
		const vFov = (this.camera.fov * Math.PI) / 180;
		const height = 2 * Math.tan(vFov / 2) * distance;
		const width = height * this.win.aspectRatio;


		return { width, height, vFov };
	}

	initCamera() {
		this.camera = new THREE.PerspectiveCamera(75, this.win.aspectRatio, 0.001, 100);
		this.camera.position.z = 1;
	}

	initScene() {
		this.scene = new THREE.Scene();

		// const camHelper = new THREE.CameraHelper(this.camera);
		// this.scene.add(camHelper);

		// this.myPlaneGeometry = new THREE.PlaneGeometry(1, 1, 12, 12);
		// this.myPlaneMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000, side: THREE.DoubleSide });
		// this.myPlane = new THREE.Mesh(this.myPlaneGeometry, this.myPlaneMaterial);
		// this.myPlane.position.y = 0.75;
		// this.scene.add(this.myPlane);
	}

	initRenderer() {
		this.renderer = new THREE.WebGLRenderer({
			canvas: this.win.canvas,
			antialias: true,
			alpha: true
		});
		this.renderer.setPixelRatio(window.devicePixelRatio);
		this.renderer.setSize(this.win.width, this.win.height);
	}

	initRaycaster() {
		this.raycaster = new THREE.Raycaster();
	}

	initGrid() {
		this.gridEl = document.querySelector('.grid');
		this.gridRect = this.gridEl.getBoundingClientRect();
		this.viewSize = this.getViewSize();

		this.gridSize = {
			width: this.viewSize.width * this.gridRect.width / this.win.width,
			height: this.viewSize.height * this.gridRect.height / this.win.height
		};
	}

	initContent() {
		this.contentEl = document.querySelector('.content');
		this.contentCloseEl = this.contentEl.querySelector('.content__close a');

		this.contentCloseEl.addEventListener('click', this.onCloseClick.bind(this));
	}

	initImages() {
		this.imagePlanes = [];
		this.viewSize = this.getViewSize();
		this.imageEls = Array.from(document.querySelectorAll('.grid__item img'));
		this.imageEls.forEach(el => {
			this.imagePlanes.push(new Media(el, this.gridSize, this.win, this.scene, this.viewSize))
		});
	}

	render() {
		this.camera.lookAt(this.scene.position);
		this.renderer.render(this.scene, this.camera);
	}

	animate() {
		this.scroll.current.x = Utils.lerp(this.scroll.current.x, this.scroll.target.x, Utils.easeOutQuart(0.025));
		this.scroll.current.y = Utils.lerp(this.scroll.current.y, this.scroll.target.y, Utils.easeOutQuart(0.025));

		if (this.scroll.current.y > this.scroll.last.y) {
			this.directionY = 'down';
		}
		else if (this.scroll.current.y < this.scroll.last.y) {
			this.directionY = 'up';
		}

		if (this.scroll.current.x > this.scroll.last.x) {
			this.directionX = 'down';
		}
		else if (this.scroll.current.x < this.scroll.last.x) {
			this.directionX = 'up';
		}


		this.imagePlanes.length && this.imagePlanes.forEach(plane => plane.update(this.scroll, this.directionX, this.directionY));
		this.render();

		this.scroll.last.x = this.scroll.current.x;
		this.scroll.last.y = this.scroll.current.y;

		requestAnimationFrame(this.animate);
	}

	onWheel(e) {
		this.scroll.target.y += e.deltaY * 5;
	}

	onTouchDown(e) {
		if (!this.canDrag) return;

		this.isDown = true;

		this.scroll.position.x = this.scroll.current.x;
		this.scroll.position.y = this.scroll.current.y;

		this.dragStart = e.touches ? e.touches[0] : e;

		this.imagePlanes.length && this.imagePlanes.forEach(plane => plane.handleTouchDown());
	}

	onTouchMove(e) {
		if (!this.isDown) return;
		const pos = e.touches ? e.touches[0] : e;
		const distY = (this.dragStart.clientY - pos.y) * 2;
		const distX = (this.dragStart.clientX - pos.x) * 2;

		this.scroll.target.x = this.scroll.position.x + distX;
		this.scroll.target.y = this.scroll.position.y + distY;
	}

	onTouchUp(e) {
		this.isDown = false;
		this.dragEnd = e.touches ? e.touches[0] : e;

		this.imagePlanes.length && this.imagePlanes.forEach(plane => plane.handleTouchUp());

		const isClick = this.dragStart.clientX === this.dragEnd.clientX && this.dragStart.clientY === this.dragEnd.clientY;

		if (isClick) {
			this.mouse = {
				x: (this.dragEnd.clientX / this.win.width) * 2 - 1,
				y: - (this.dragEnd.clientY / this.win.height) * 2 + 1
			};

			this.raycaster.setFromCamera(this.mouse, this.camera);

			const intersects = this.raycaster.intersectObjects(this.scene.children);

			intersects.forEach(int => {
				this.currentID = int.object.id;
			});

			this.imagePlanes.forEach(el => {
				if (el.plane.id === this.currentID) {
					this.canDrag = false;
					el.handleClick();
					this.contentEl.classList.add('is-visible');
				}
			});

		}
	}

	onCloseClick(e) {
		e.preventDefault();

		this.imagePlanes.forEach(el => {
			if (el.plane.id === this.currentID) el.handleClose();
		});

		this.contentEl.classList.remove('is-visible');
		this.canDrag = true;
		this.currentID = -1;
	}

	onResize() {
		this.win.width = window.innerWidth;
		this.win.height = window.innerHeight;
		this.win.aspectRatio = window.innerWidth / window.innerHeight;
		this.camera.aspect = this.win.aspectRatio;

		this.viewSize = this.getViewSize();
		this.gridRect = this.gridEl.getBoundingClientRect();
		this.gridSize = {
			width: this.viewSize.width * this.gridRect.width / this.win.width,
			height: this.viewSize.height * this.gridRect.height / this.win.height
		};
		this.imagePlanes.length && this.imagePlanes.forEach(plane => {
			plane.handleResize(this.win, this.viewSize, this.gridSize);
		});

		this.camera.updateProjectionMatrix();
		this.renderer.setSize(this.win.width, this.win.height);
	}
}
