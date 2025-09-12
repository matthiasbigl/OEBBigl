/**
 * Component-specific animation utilities
 * Reusable animations for common UI components across the application
 */

import { gsap } from 'gsap';
import { browser } from '$app/environment';
import { ANIMATION_CONFIG, ANIMATION_PRESETS } from './pageAnimations';

/**
 * Departure card animations
 */
export const departureAnimations = {
	/**
	 * Animate departure cards entering the view
	 */
	entranceStagger(cards: HTMLElement[]): gsap.core.Timeline {
		if (!browser || !cards.length) return gsap.timeline();
		
		return gsap.timeline()
			.fromTo(cards, {
				opacity: 0,
				y: 30,
				scale: 0.95
			}, {
				opacity: 1,
				y: 0,
				scale: 1,
				duration: ANIMATION_CONFIG.NORMAL,
				ease: ANIMATION_CONFIG.EASING.SMOOTH,
				stagger: ANIMATION_CONFIG.STAGGER.TIGHT
			});
	},

	/**
	 * Animate departure time updates
	 */
	timeUpdate(element: HTMLElement): void {
		if (!browser) return;
		
		gsap.fromTo(element, {
			scale: 1.1,
			color: "#60a5fa" // blue-400
		}, {
			scale: 1,
			color: "inherit",
			duration: ANIMATION_CONFIG.QUICK,
			ease: ANIMATION_CONFIG.EASING.BOUNCE
		});
	},

	/**
	 * Animate delay indicators
	 */
	delayIndicator(element: HTMLElement): void {
		if (!browser) return;
		
		gsap.fromTo(element, {
			opacity: 0,
			scale: 0.8
		}, {
			opacity: 1,
			scale: 1,
			duration: ANIMATION_CONFIG.QUICK,
			ease: ANIMATION_CONFIG.EASING.BOUNCE
		});
	}
};

/**
 * Filter component animations
 */
export const filterAnimations = {
	/**
	 * Animate filter buttons appearing
	 */
	buttonEntrance(buttons: HTMLElement[]): gsap.core.Timeline {
		if (!browser || !buttons.length) return gsap.timeline();
		
		return gsap.timeline()
			.fromTo(buttons, {
				opacity: 0,
				scale: 0.8,
				y: 10
			}, {
				opacity: 1,
				scale: 1,
				y: 0,
				duration: ANIMATION_CONFIG.NORMAL,
				ease: ANIMATION_CONFIG.EASING.BOUNCE,
				stagger: ANIMATION_CONFIG.STAGGER.TIGHT
			});
	},

	/**
	 * Animate filter activation
	 */
	activate(element: HTMLElement): void {
		if (!browser) return;
		
		gsap.to(element, {
			scale: 1.05,
			duration: ANIMATION_CONFIG.QUICK,
			ease: ANIMATION_CONFIG.EASING.BOUNCE,
			yoyo: true,
			repeat: 1
		});
	},

	/**
	 * Animate filter clearing
	 */
	clear(elements: HTMLElement[]): gsap.core.Timeline {
		if (!browser || !elements.length) return gsap.timeline();
		
		return gsap.timeline()
			.to(elements, {
				scale: 0.9,
				opacity: 0.7,
				duration: ANIMATION_CONFIG.QUICK,
				ease: ANIMATION_CONFIG.EASING.SMOOTH
			})
			.to(elements, {
				scale: 1,
				opacity: 1,
				duration: ANIMATION_CONFIG.QUICK,
				ease: ANIMATION_CONFIG.EASING.BOUNCE
			});
	}
};

/**
 * Search component animations
 */
export const searchAnimations = {
	/**
	 * Animate search suggestions appearing
	 */
	suggestionsEntrance(container: HTMLElement, items: HTMLElement[]): gsap.core.Timeline {
		if (!browser) return gsap.timeline();
		
		const timeline = gsap.timeline();
		
		// Container entrance
		timeline.fromTo(container, {
			opacity: 0,
			y: -10,
			scale: 0.95
		}, {
			opacity: 1,
			y: 0,
			scale: 1,
			duration: ANIMATION_CONFIG.QUICK,
			ease: ANIMATION_CONFIG.EASING.SMOOTH
		});
		
		// Stagger items
		if (items.length) {
			timeline.fromTo(items, {
				opacity: 0,
				x: -20
			}, {
				opacity: 1,
				x: 0,
				duration: ANIMATION_CONFIG.QUICK,
				ease: ANIMATION_CONFIG.EASING.SMOOTH,
				stagger: ANIMATION_CONFIG.STAGGER.TIGHT
			}, "-=0.1");
		}
		
		return timeline;
	},

	/**
	 * Animate search input focus
	 */
	inputFocus(element: HTMLElement): void {
		if (!browser) return;
		
		gsap.to(element, {
			scale: 1.02,
			duration: ANIMATION_CONFIG.QUICK,
			ease: ANIMATION_CONFIG.EASING.SMOOTH
		});
	},

	/**
	 * Animate search input blur
	 */
	inputBlur(element: HTMLElement): void {
		if (!browser) return;
		
		gsap.to(element, {
			scale: 1,
			duration: ANIMATION_CONFIG.QUICK,
			ease: ANIMATION_CONFIG.EASING.SMOOTH
		});
	}
};

/**
 * Loading component animations
 */
export const loadingAnimations = {
	/**
	 * Create a pulsing loading animation
	 */
	pulse(elements: HTMLElement | HTMLElement[]): gsap.core.Tween {
		if (!browser) return gsap.to({}, {});
		
		return gsap.to(elements, {
			opacity: 0.5,
			duration: 1,
			ease: ANIMATION_CONFIG.EASING.PULSE,
			repeat: -1,
			yoyo: true
		});
	},

	/**
	 * Create a spinning loading animation
	 */
	spin(element: HTMLElement): gsap.core.Tween {
		if (!browser) return gsap.to({}, {});
		
		return gsap.to(element, {
			rotation: 360,
			duration: 2,
			ease: "none",
			repeat: -1
		});
	},

	/**
	 * Create a skeleton loading animation
	 */
	skeleton(elements: HTMLElement[]): gsap.core.Timeline {
		if (!browser || !elements.length) return gsap.timeline();
		
		return gsap.timeline({ repeat: -1 })
			.to(elements, {
				opacity: 0.4,
				duration: 1,
				ease: ANIMATION_CONFIG.EASING.SMOOTH,
				stagger: 0.1
			})
			.to(elements, {
				opacity: 1,
				duration: 1,
				ease: ANIMATION_CONFIG.EASING.SMOOTH,
				stagger: 0.1
			});
	}
};

/**
 * Error/Success message animations
 */
export const messageAnimations = {
	/**
	 * Animate error message entrance
	 */
	errorEntrance(element: HTMLElement): gsap.core.Timeline {
		if (!browser) return gsap.timeline();
		
		return gsap.timeline()
			.fromTo(element, {
				opacity: 0,
				y: -20,
				scale: 0.9
			}, {
				opacity: 1,
				y: 0,
				scale: 1,
				duration: ANIMATION_CONFIG.NORMAL,
				ease: ANIMATION_CONFIG.EASING.BOUNCE
			})
			.to(element, {
				keyframes: {
					x: [0, -5, 5, -3, 3, 0]
				},
				duration: 0.5,
				ease: ANIMATION_CONFIG.EASING.SMOOTH
			}, "-=0.2");
	},

	/**
	 * Animate success message entrance
	 */
	successEntrance(element: HTMLElement): gsap.core.Timeline {
		if (!browser) return gsap.timeline();
		
		return gsap.timeline()
			.fromTo(element, {
				opacity: 0,
				scale: 0.8,
				y: 20
			}, {
				opacity: 1,
				scale: 1,
				y: 0,
				duration: ANIMATION_CONFIG.NORMAL,
				ease: ANIMATION_CONFIG.EASING.BOUNCE
			});
	},

	/**
	 * Animate message dismissal
	 */
	dismiss(element: HTMLElement): gsap.core.Timeline {
		if (!browser) return gsap.timeline();
		
		return gsap.timeline()
			.to(element, {
				opacity: 0,
				scale: 0.9,
				y: -10,
				duration: ANIMATION_CONFIG.QUICK,
				ease: ANIMATION_CONFIG.EASING.SMOOTH
			});
	}
};

/**
 * Modal/Dialog animations
 */
export const modalAnimations = {
	/**
	 * Animate modal entrance
	 */
	entrance(backdrop: HTMLElement, modal: HTMLElement): gsap.core.Timeline {
		if (!browser) return gsap.timeline();
		
		const timeline = gsap.timeline();
		
		// Backdrop fade in
		timeline.fromTo(backdrop, {
			opacity: 0
		}, {
			opacity: 1,
			duration: ANIMATION_CONFIG.QUICK,
			ease: ANIMATION_CONFIG.EASING.SMOOTH
		});
		
		// Modal slide up and scale
		timeline.fromTo(modal, {
			opacity: 0,
			y: 50,
			scale: 0.9
		}, {
			opacity: 1,
			y: 0,
			scale: 1,
			duration: ANIMATION_CONFIG.NORMAL,
			ease: ANIMATION_CONFIG.EASING.BOUNCE
		}, "-=0.1");
		
		return timeline;
	},

	/**
	 * Animate modal exit
	 */
	exit(backdrop: HTMLElement, modal: HTMLElement): gsap.core.Timeline {
		if (!browser) return gsap.timeline();
		
		const timeline = gsap.timeline();
		
		// Modal slide down and scale
		timeline.to(modal, {
			opacity: 0,
			y: 30,
			scale: 0.95,
			duration: ANIMATION_CONFIG.QUICK,
			ease: ANIMATION_CONFIG.EASING.SMOOTH
		});
		
		// Backdrop fade out
		timeline.to(backdrop, {
			opacity: 0,
			duration: ANIMATION_CONFIG.QUICK,
			ease: ANIMATION_CONFIG.EASING.SMOOTH
		}, "-=0.1");
		
		return timeline;
	}
};

/**
 * Time update animations (useful for departure cards)
 */
export const timeAnimations = {
	/**
	 * Animate time value updates
	 */
	update(element: HTMLElement): void {
		if (!browser) return;
		
		gsap.fromTo(element, {
			scale: 1.1,
			color: "#60a5fa" // blue-400
		}, {
			scale: 1,
			color: "inherit",
			duration: ANIMATION_CONFIG.QUICK,
			ease: ANIMATION_CONFIG.EASING.BOUNCE
		});
	},

	/**
	 * Animate delay indicators
	 */
	delayIndicator(element: HTMLElement): void {
		if (!browser) return;
		
		gsap.fromTo(element, {
			opacity: 0,
			scale: 0.8
		}, {
			opacity: 1,
			scale: 1,
			duration: ANIMATION_CONFIG.QUICK,
			ease: ANIMATION_CONFIG.EASING.BOUNCE
		});
	},

	/**
	 * Pulse animation for real-time indicators
	 */
	realtimePulse(element: HTMLElement): gsap.core.Tween {
		if (!browser) return gsap.to({}, {});
		
		return gsap.to(element, {
			opacity: 0.5,
			scale: 1.1,
			duration: 1,
			ease: ANIMATION_CONFIG.EASING.PULSE,
			repeat: -1,
			yoyo: true
		});
	}
};

/**
 * Navigation animations
 */
export const navigationAnimations = {
	/**
	 * Animate navigation items entrance
	 */
	itemsEntrance(items: HTMLElement[]): gsap.core.Timeline {
		if (!browser || !items.length) return gsap.timeline();
		
		return gsap.timeline()
			.fromTo(items, {
				opacity: 0,
				y: -20
			}, {
				opacity: 1,
				y: 0,
				duration: ANIMATION_CONFIG.NORMAL,
				ease: ANIMATION_CONFIG.EASING.SMOOTH,
				stagger: ANIMATION_CONFIG.STAGGER.NORMAL
			});
	},

	/**
	 * Animate active navigation indicator
	 */
	activeIndicator(element: HTMLElement, fromElement?: HTMLElement): gsap.core.Timeline {
		if (!browser) return gsap.timeline();
		
		const timeline = gsap.timeline();
		
		if (fromElement) {
			// Get positions for smooth transition
			const fromRect = fromElement.getBoundingClientRect();
			const toRect = element.getBoundingClientRect();
			const deltaX = fromRect.left - toRect.left;
			const deltaW = fromRect.width - toRect.width;
			
			timeline.fromTo(element, {
				x: deltaX,
				width: fromRect.width
			}, {
				x: 0,
				width: toRect.width,
				duration: ANIMATION_CONFIG.NORMAL,
				ease: ANIMATION_CONFIG.EASING.SMOOTH
			});
		} else {
			timeline.fromTo(element, {
				scaleX: 0,
				opacity: 0
			}, {
				scaleX: 1,
				opacity: 1,
				duration: ANIMATION_CONFIG.NORMAL,
				ease: ANIMATION_CONFIG.EASING.SMOOTH
			});
		}
		
		return timeline;
	}
};

/**
 * Collapsible content animations
 */
export const collapsibleAnimations = {
	/**
	 * Animate collapsible content collapse
	 */
	collapse(element: HTMLElement): gsap.core.Tween {
		if (!browser) return gsap.to({}, {});
		
		return gsap.to(element, {
			height: 0,
			opacity: 0,
			duration: ANIMATION_CONFIG.NORMAL,
			ease: ANIMATION_CONFIG.EASING.SMOOTH
		});
	},

	/**
	 * Animate collapsible content expand
	 */
	expand(element: HTMLElement): gsap.core.Timeline {
		if (!browser) return gsap.timeline();
		
		const timeline = gsap.timeline();
		
		// First, get the natural height
		gsap.set(element, { height: 'auto' });
		const autoHeight = element.offsetHeight;
		gsap.set(element, { height: 0, opacity: 0 });
		
		// Then animate to that height
		timeline.to(element, {
			height: autoHeight,
			opacity: 1,
			duration: ANIMATION_CONFIG.NORMAL,
			ease: ANIMATION_CONFIG.EASING.SMOOTH,
			onComplete: () => {
				gsap.set(element, { height: 'auto' });
			}
		});
		
		return timeline;
	},

	/**
	 * Animate collapsible content toggle
	 */
	toggle(element: HTMLElement, shouldCollapse: boolean): gsap.core.Timeline | gsap.core.Tween {
		if (!browser) return gsap.timeline();
		
		if (shouldCollapse) {
			return collapsibleAnimations.collapse(element);
		} else {
			return collapsibleAnimations.expand(element);
		}
	}
};

/**
 * Utility function to cleanup component animations
 */
export function cleanupComponentAnimations(elements: (HTMLElement | null)[]): void {
	if (!browser) return;
	
	elements.forEach(element => {
		if (element) {
			gsap.killTweensOf(element);
		}
	});
}

/**
 * Utility to check if reduced motion is preferred
 */
export function prefersReducedMotion(): boolean {
	if (!browser) return false;
	return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Wrapper function that respects user's motion preferences
 */
export function respectMotionPreference<T extends (...args: any[]) => any>(
	animationFn: T,
	fallbackFn?: () => void
): T {
	return ((...args: Parameters<T>) => {
		if (prefersReducedMotion()) {
			fallbackFn?.();
			return gsap.timeline(); // Return empty timeline
		}
		return animationFn(...args);
	}) as T;
}
