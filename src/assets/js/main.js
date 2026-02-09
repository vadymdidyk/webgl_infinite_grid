import '../scss/main.scss';
import WebGLGrid from './modules/WebGLGrid';

class App {
	constructor() {
		this.win = {
			width: window.innerWidth,
			height: window.innerHeight,
			aspectRatio: window.innerWidth / window.innerHeight,
			isMobile: window.innerWidth <= 767,
		};
	}

	init() {
		this.onDocReady();
		this.onPageReady();
		this.bindEvents();
	}

	bindEvents() {}

	onFirstLoad() {}

	onDocReady() {}

	onPageReady() {
		this.initGrid();
	}

	onResize() {}

	initGrid() {
		this.grid = new WebGLGrid();
		this.grid.init();
	}
}

const app = new App();
app.init();
