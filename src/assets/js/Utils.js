export default class Utils {
	static isInViewport(el) {
		const rect = el.getBoundingClientRect();
		const winHeight = window.innerHeight;

		return rect.top >= -rect.height && rect.top <= winHeight;
	}

	static lerp (p1, p2, t) {
		return p1 + (p2 - p1) * t
	}

	static easeOutQuart(t) {
		return 1-(--t)*t*t*t;
	}
}