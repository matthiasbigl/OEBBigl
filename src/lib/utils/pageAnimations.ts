/**
 * Comprehensive animation utilities using GSAP
 * Reusable across pages and components for consistent animations
 */

import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { browser } from '$app/environment';

// Animation configuration constants
export const ANIMATION_CONFIG = {
	// Timing
	INITIAL_DELAY: 0.2,
	HEADER_DURATION: 1.2,
	SEARCH_DURATION: 0.8,
	STATION_DURATION: 0.9,
	SCANLINE_DURATION: 3,
	PULSE_DURATION: 2,
	
	// Common durations for reusable animations
	QUICK: 0.3,
	NORMAL: 0.6,
	SLOW: 1.0,
	
	// Floating animation range
	FLOATING_DURATION: { min: 3, max: 6 },
	
	// Parallax multipliers
	PARALLAX: { x: 60, y: 80 },
	
	// Easing curves
	EASING: {
		ENTRANCE: "power3.out",
		SEARCH: "back.out(1.2)",
		STATION: "power2.out",
		FLOATING: "sine.inOut",
		PULSE: "power2.inOut",
		SMOOTH: "power2.out",
		BOUNCE: "back.out(1.7)",
		ELASTIC: "elastic.out(1, 0.3)"
	},
	
	// Stagger amounts
	STAGGER: {
		TIGHT: 0.05,
		NORMAL: 0.1,
		LOOSE: 0.2
	}
} as const;

export interface AnimationElements {
	pageContainer: HTMLElement;
	headerRef: HTMLElement;
	gridBackground: HTMLElement;
	searchContainer: HTMLElement;
	stationContainer: HTMLElement;
	departuresContainer: HTMLElement;
}

export interface AnimationController {
	initialize: () => void;
	cleanup: () => void;
}

/**
 * Common animation presets for consistent UI animations
 */
export const ANIMATION_PRESETS = {
	// Card animations
	CARD_ENTRANCE: {
		from: { opacity: 0, y: 20, scale: 0.95 },
		to: { opacity: 1, y: 0, scale: 1, duration: ANIMATION_CONFIG.NORMAL, ease: ANIMATION_CONFIG.EASING.SMOOTH }
	},
	
	// Button animations
	BUTTON_HOVER: {
		to: { scale: 1.05, duration: ANIMATION_CONFIG.QUICK, ease: ANIMATION_CONFIG.EASING.SMOOTH }
	},
	BUTTON_PRESS: {
		to: { scale: 0.95, duration: 0.1, ease: ANIMATION_CONFIG.EASING.SMOOTH }
	},
	
	// Filter animations
	FILTER_ACTIVATE: {
		to: { scale: 1.1, duration: ANIMATION_CONFIG.QUICK, ease: ANIMATION_CONFIG.EASING.BOUNCE }
	},
	
	// Loading animations
	LOADING_PULSE: {
		to: { opacity: 0.5, duration: 1, ease: ANIMATION_CONFIG.EASING.PULSE, repeat: -1, yoyo: true }
	},
	
	// Page transitions
	PAGE_SLIDE_IN: {
		from: { x: '100%', opacity: 0 },
		to: { x: '0%', opacity: 1, duration: ANIMATION_CONFIG.SLOW, ease: ANIMATION_CONFIG.EASING.SMOOTH }
	},
	PAGE_FADE_IN: {
		from: { opacity: 0 },
		to: { opacity: 1, duration: ANIMATION_CONFIG.NORMAL, ease: ANIMATION_CONFIG.EASING.SMOOTH }
	}
} as const;

/**
 * Creates a page animation controller with initialization and cleanup
 */
export function createPageAnimations(elements: AnimationElements): AnimationController {
	let isInitialized = false;
	let activeTimelines: gsap.core.Timeline[] = [];
	let activeScrollTriggers: ScrollTrigger[] = [];
	
	/**
	 * Sets initial animation states for elements
	 */
	function setInitialStates(): void {
		const { headerRef, searchContainer, stationContainer } = elements;
		
		if (!browser || !headerRef || !searchContainer) return;
		
		// Set initial states for mobile-first animations
		gsap.set([headerRef, searchContainer], { 
			opacity: 0, 
			y: -30,
			scale: 0.95
		});
		
		if (stationContainer) {
			gsap.set(stationContainer, { 
				opacity: 0, 
				y: 20,
				scale: 0.98
			});
		}
	}
	
	/**
	 * Creates the main entrance animation timeline
	 */
	function createEntranceAnimations(): void {
		const { headerRef, searchContainer, stationContainer } = elements;
		
		const mainTl = gsap.timeline({ delay: ANIMATION_CONFIG.INITIAL_DELAY });
		activeTimelines.push(mainTl);
		
		// Header entrance with cyber effect
		if (headerRef) {
			mainTl.to(headerRef, {
				opacity: 1,
				y: 0,
				scale: 1,
				duration: ANIMATION_CONFIG.HEADER_DURATION,
				ease: ANIMATION_CONFIG.EASING.ENTRANCE
			});
		}
		
		// Search container with smooth slide
		if (searchContainer) {
			mainTl.to(searchContainer, {
				opacity: 1,
				y: 0,
				scale: 1,
				duration: ANIMATION_CONFIG.SEARCH_DURATION,
				ease: ANIMATION_CONFIG.EASING.SEARCH
			}, "-=0.6");
		}
		
		// Station container with gentle bounce
		if (stationContainer) {
			mainTl.to(stationContainer, {
				opacity: 1,
				y: 0,
				scale: 1,
				duration: ANIMATION_CONFIG.STATION_DURATION,
				ease: ANIMATION_CONFIG.EASING.STATION
			}, "-=0.4");
		}
	}
	
	/**
	 * Sets up scroll-based parallax effect
	 */
	function setupParallaxEffect(): void {
		const { pageContainer, gridBackground } = elements;
		
		if (!gridBackground || !pageContainer) return;
		
		const scrollTrigger = ScrollTrigger.create({
			trigger: pageContainer,
			start: "top top",
			end: "bottom top",
			scrub: true,
			onUpdate: (self) => {
				const progress = self.progress;
				const yPos = progress * ANIMATION_CONFIG.PARALLAX.y;
				const xPos = progress * ANIMATION_CONFIG.PARALLAX.x;
				gsap.set(gridBackground, {
					transform: `translate(${xPos}px, ${yPos}px)`
				});
			}
		});
		
		activeScrollTriggers.push(scrollTrigger);
	}
	
	/**
	 * Sets up ambient background animations
	 */
	function setupAmbientAnimations(): void {
		// Scanlines animation
		const scanlineElements = document.querySelectorAll(".scanline");
		if (scanlineElements.length > 0) {
			gsap.to(scanlineElements, {
				y: "120vh",
				duration: ANIMATION_CONFIG.SCANLINE_DURATION,
				ease: "none",
				repeat: -1,
				stagger: {
					amount: 1.5,
					from: "random"
				}
			});
		}
		
		// Floating elements
		const floatingElements = document.querySelectorAll(".floating-element");
		if (floatingElements.length > 0) {
			gsap.to(floatingElements, {
				y: "random(-5, 5)",
				rotation: "random(-1, 1)",
				duration: `random(${ANIMATION_CONFIG.FLOATING_DURATION.min}, ${ANIMATION_CONFIG.FLOATING_DURATION.max})`,
				ease: ANIMATION_CONFIG.EASING.FLOATING,
				repeat: -1,
				yoyo: true,
				stagger: 0.3
			});
		}
		
		// Pulse effect for status indicators
		const pulseElements = document.querySelectorAll(".pulse-element");
		if (pulseElements.length > 0) {
			gsap.to(pulseElements, {
				scale: 1.05,
				opacity: 0.8,
				duration: ANIMATION_CONFIG.PULSE_DURATION,
				ease: ANIMATION_CONFIG.EASING.PULSE,
				repeat: -1,
				yoyo: true
			});
		}
	}
	
	/**
	 * Initialize all animations
	 */
	function initialize(): void {
		if (!browser || isInitialized) return;
		
		// Register GSAP plugins
		gsap.registerPlugin(ScrollTrigger);
		
		// Guard against missing required elements
		if (!elements.headerRef || !elements.searchContainer) {
			console.warn('PageAnimations: Required elements not found');
			return;
		}
		
		setInitialStates();
		createEntranceAnimations();
		setupParallaxEffect();
		setupAmbientAnimations();
		
		isInitialized = true;
	}
	
	/**
	 * Cleanup all animations and scroll triggers
	 */
	function cleanup(): void {
		if (!browser || !isInitialized) return;
		
		// Kill all active timelines
		activeTimelines.forEach(timeline => timeline.kill());
		activeTimelines = [];
		
		// Kill all scroll triggers
		activeScrollTriggers.forEach(trigger => trigger.kill());
		activeScrollTriggers = [];
		
		// Kill tweens on specific elements
		const elementsToCleanup = Object.values(elements);
		elementsToCleanup.forEach(element => {
			if (element) gsap.killTweensOf(element);
		});
		
		// Global ScrollTrigger cleanup
		ScrollTrigger.getAll().forEach(trigger => trigger.kill());
		ScrollTrigger.refresh();
		
		isInitialized = false;
	}
	
	return {
		initialize,
		cleanup
	};
}

/**
 * Utility for creating simple fade-in animations
 */
export function createFadeInAnimation(
	elements: HTMLElement | HTMLElement[], 
	options: {
		duration?: number;
		delay?: number;
		stagger?: number;
		ease?: string;
	} = {}
): gsap.core.Timeline {
	const {
		duration = 0.6,
		delay = 0,
		stagger = 0.1,
		ease = "power2.out"
	} = options;
	
	const timeline = gsap.timeline({ delay });
	
	timeline.fromTo(elements, {
		opacity: 0,
		y: 20
	}, {
		opacity: 1,
		y: 0,
		duration,
		ease,
		stagger
	});
	
	return timeline;
}

/**
 * Utility for creating slide animations
 */
export function createSlideAnimation(
	elements: HTMLElement | HTMLElement[],
	direction: 'up' | 'down' | 'left' | 'right' = 'up',
	options: {
		duration?: number;
		delay?: number;
		ease?: string;
	} = {}
): gsap.core.Timeline {
	const {
		duration = 0.8,
		delay = 0,
		ease = "power2.out"
	} = options;
	
	const directionMap = {
		up: { y: 30 },
		down: { y: -30 },
		left: { x: 30 },
		right: { x: -30 }
	};
	
	const timeline = gsap.timeline({ delay });
	
	timeline.fromTo(elements, {
		opacity: 0,
		...directionMap[direction]
	}, {
		opacity: 1,
		x: 0,
		y: 0,
		duration,
		ease
	});
	
	return timeline;
}

/**
 * Utility for creating staggered grid animations (perfect for departure cards, filter buttons, etc.)
 */
export function createStaggeredGridAnimation(
	elements: HTMLElement[],
	options: {
		duration?: number;
		delay?: number;
		stagger?: number;
		ease?: string;
		from?: 'start' | 'center' | 'end' | 'random';
	} = {}
): gsap.core.Timeline {
	const {
		duration = ANIMATION_CONFIG.NORMAL,
		delay = 0,
		stagger = ANIMATION_CONFIG.STAGGER.NORMAL,
		ease = ANIMATION_CONFIG.EASING.SMOOTH,
		from = 'start'
	} = options;
	
	const timeline = gsap.timeline({ delay });
	
	timeline.fromTo(elements, 
		ANIMATION_PRESETS.CARD_ENTRANCE.from,
		{
			...ANIMATION_PRESETS.CARD_ENTRANCE.to,
			duration,
			ease,
			stagger: {
				amount: stagger * elements.length,
				from
			}
		}
	);
	
	return timeline;
}

/**
 * Utility for button interaction animations
 */
export function createButtonAnimations(element: HTMLElement): {
	hover: () => void;
	press: () => void;
	release: () => void;
} {
	return {
		hover: () => gsap.to(element, ANIMATION_PRESETS.BUTTON_HOVER.to),
		press: () => gsap.to(element, ANIMATION_PRESETS.BUTTON_PRESS.to),
		release: () => gsap.to(element, { scale: 1, duration: ANIMATION_CONFIG.QUICK })
	};
}

/**
 * Utility for filter toggle animations
 */
export function animateFilterToggle(element: HTMLElement, isActive: boolean): void {
	if (!browser) return;
	
	if (isActive) {
		gsap.to(element, ANIMATION_PRESETS.FILTER_ACTIVATE.to);
	} else {
		gsap.to(element, { 
			scale: 1, 
			duration: ANIMATION_CONFIG.QUICK, 
			ease: ANIMATION_CONFIG.EASING.SMOOTH 
		});
	}
}

/**
 * Utility for loading state animations
 */
export function createLoadingAnimation(elements: HTMLElement | HTMLElement[]): gsap.core.Tween {
	return gsap.to(elements, ANIMATION_PRESETS.LOADING_PULSE.to);
}

/**
 * Utility for page transition animations
 */
export function createPageTransition(
	element: HTMLElement,
	type: 'slide' | 'fade' = 'fade',
	direction: 'in' | 'out' = 'in'
): gsap.core.Timeline {
	const timeline = gsap.timeline();
	
	if (type === 'slide') {
		if (direction === 'in') {
			timeline.fromTo(element, 
				ANIMATION_PRESETS.PAGE_SLIDE_IN.from,
				ANIMATION_PRESETS.PAGE_SLIDE_IN.to
			);
		} else {
			timeline.to(element, {
				x: '-100%',
				opacity: 0,
				duration: ANIMATION_CONFIG.SLOW,
				ease: ANIMATION_CONFIG.EASING.SMOOTH
			});
		}
	} else {
		if (direction === 'in') {
			timeline.fromTo(element,
				ANIMATION_PRESETS.PAGE_FADE_IN.from,
				ANIMATION_PRESETS.PAGE_FADE_IN.to
			);
		} else {
			timeline.to(element, {
				opacity: 0,
				duration: ANIMATION_CONFIG.NORMAL,
				ease: ANIMATION_CONFIG.EASING.SMOOTH
			});
		}
	}
	
	return timeline;
}

/**
 * Utility for creating scroll-triggered animations
 */
export function createScrollAnimation(
	element: HTMLElement,
	animationProps: gsap.TweenVars,
	options: {
		trigger?: HTMLElement;
		start?: string;
		end?: string;
		scrub?: boolean | number;
		once?: boolean;
	} = {}
): ScrollTrigger {
	const {
		trigger = element,
		start = "top 80%",
		end = "bottom 20%",
		scrub = false,
		once = true
	} = options;
	
	return ScrollTrigger.create({
		trigger,
		start,
		end,
		scrub,
		once,
		animation: gsap.fromTo(element, {
			opacity: 0,
			y: 50
		}, {
			opacity: 1,
			y: 0,
			duration: ANIMATION_CONFIG.NORMAL,
			ease: ANIMATION_CONFIG.EASING.SMOOTH,
			...animationProps
		})
	});
}

/**
 * Utility for creating hover effects on multiple elements
 */
export function addHoverEffects(
	elements: HTMLElement[],
	hoverAnimation: gsap.TweenVars = ANIMATION_PRESETS.BUTTON_HOVER.to
): void {
	if (!browser) return;
	
	elements.forEach(element => {
		element.addEventListener('mouseenter', () => {
			gsap.to(element, hoverAnimation);
		});
		
		element.addEventListener('mouseleave', () => {
			gsap.to(element, {
				scale: 1,
				rotation: 0,
				duration: ANIMATION_CONFIG.QUICK,
				ease: ANIMATION_CONFIG.EASING.SMOOTH
			});
		});
	});
}

/**
 * Utility for creating a morphing background effect
 */
export function createMorphingBackground(element: HTMLElement): gsap.core.Timeline {
	if (!browser) return gsap.timeline();
	
	return gsap.timeline({ repeat: -1 })
		.to(element, {
			backgroundPosition: "100% 0%",
			duration: 8,
			ease: "sine.inOut"
		})
		.to(element, {
			backgroundPosition: "0% 0%",
			duration: 8,
			ease: "sine.inOut"
		});
}

/**
 * Cleanup utility for removing all animations on elements
 */
export function cleanupElementAnimations(elements: (HTMLElement | null)[]): void {
	if (!browser) return;
	
	elements.forEach(element => {
		if (element) {
			gsap.killTweensOf(element);
		}
	});
}

/**
 * Batch animation utility for consistent timing across multiple elements
 */
export function createBatchAnimation(
	batches: Array<{
		elements: HTMLElement[];
		animation: gsap.TweenVars;
		delay?: number;
		stagger?: number;
	}>
): gsap.core.Timeline {
	const masterTimeline = gsap.timeline();
	
	batches.forEach(({ elements, animation, delay = 0, stagger = 0 }, index) => {
		const batchTimeline = gsap.timeline();
		
		batchTimeline.fromTo(elements, {
			opacity: 0,
			y: 20
		}, {
			opacity: 1,
			y: 0,
			duration: ANIMATION_CONFIG.NORMAL,
			ease: ANIMATION_CONFIG.EASING.SMOOTH,
			stagger,
			...animation
		});
		
		masterTimeline.add(batchTimeline, delay);
	});
	
	return masterTimeline;
}
