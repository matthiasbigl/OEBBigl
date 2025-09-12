/**
 * Page-specific animation utilities
 * Reusable animations for different page types and layouts
 */

import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { browser } from '$app/environment';
import { ANIMATION_CONFIG } from './pageAnimations';

/**
 * Landing page animations
 */
export const landingPageAnimations = {
	/**
	 * Hero section entrance animation
	 */
	heroEntrance(
		title: HTMLElement,
		subtitle: HTMLElement,
		cta: HTMLElement
	): gsap.core.Timeline {
		if (!browser) return gsap.timeline();
		
		const timeline = gsap.timeline();
		
		// Title with typewriter effect
		timeline.fromTo(title, {
			opacity: 0,
			y: 50
		}, {
			opacity: 1,
			y: 0,
			duration: ANIMATION_CONFIG.SLOW,
			ease: ANIMATION_CONFIG.EASING.ENTRANCE
		});
		
		// Subtitle slide in
		timeline.fromTo(subtitle, {
			opacity: 0,
			y: 30
		}, {
			opacity: 1,
			y: 0,
			duration: ANIMATION_CONFIG.NORMAL,
			ease: ANIMATION_CONFIG.EASING.SMOOTH
		}, "-=0.5");
		
		// CTA button bounce in
		timeline.fromTo(cta, {
			opacity: 0,
			scale: 0.8
		}, {
			opacity: 1,
			scale: 1,
			duration: ANIMATION_CONFIG.NORMAL,
			ease: ANIMATION_CONFIG.EASING.BOUNCE
		}, "-=0.3");
		
		return timeline;
	},

	/**
	 * Feature cards staggered entrance
	 */
	featureCards(cards: HTMLElement[]): gsap.core.Timeline {
		if (!browser || !cards.length) return gsap.timeline();
		
		return gsap.timeline()
			.fromTo(cards, {
				opacity: 0,
				y: 50,
				rotationX: 45
			}, {
				opacity: 1,
				y: 0,
				rotationX: 0,
				duration: ANIMATION_CONFIG.NORMAL,
				ease: ANIMATION_CONFIG.EASING.SMOOTH,
				stagger: ANIMATION_CONFIG.STAGGER.NORMAL
			});
	}
};

/**
 * Dashboard page animations
 */
export const dashboardAnimations = {
	/**
	 * Widget entrance animations
	 */
	widgetEntrance(widgets: HTMLElement[]): gsap.core.Timeline {
		if (!browser || !widgets.length) return gsap.timeline();
		
		return gsap.timeline()
			.fromTo(widgets, {
				opacity: 0,
				scale: 0.9,
				y: 20
			}, {
				opacity: 1,
				scale: 1,
				y: 0,
				duration: ANIMATION_CONFIG.NORMAL,
				ease: ANIMATION_CONFIG.EASING.SMOOTH,
				stagger: ANIMATION_CONFIG.STAGGER.TIGHT
			});
	},

	/**
	 * Statistics counter animation
	 */
	countUp(element: HTMLElement, from: number, to: number): gsap.core.Tween {
		if (!browser) return gsap.to({}, {});
		
		const obj = { value: from };
		return gsap.to(obj, {
			value: to,
			duration: 2,
			ease: ANIMATION_CONFIG.EASING.SMOOTH,
			onUpdate: () => {
				element.textContent = Math.round(obj.value).toString();
			}
		});
	},

	/**
	 * Chart reveal animation
	 */
	chartReveal(container: HTMLElement): gsap.core.Timeline {
		if (!browser) return gsap.timeline();
		
		return gsap.timeline()
			.fromTo(container, {
				opacity: 0,
				clipPath: 'inset(100% 0% 0% 0%)'
			}, {
				opacity: 1,
				clipPath: 'inset(0% 0% 0% 0%)',
				duration: ANIMATION_CONFIG.SLOW,
				ease: ANIMATION_CONFIG.EASING.SMOOTH
			});
	}
};

/**
 * List/Grid page animations
 */
export const listPageAnimations = {
	/**
	 * List items staggered entrance
	 */
	itemsEntrance(items: HTMLElement[]): gsap.core.Timeline {
		if (!browser || !items.length) return gsap.timeline();
		
		return gsap.timeline()
			.fromTo(items, {
				opacity: 0,
				x: -30
			}, {
				opacity: 1,
				x: 0,
				duration: ANIMATION_CONFIG.NORMAL,
				ease: ANIMATION_CONFIG.EASING.SMOOTH,
				stagger: ANIMATION_CONFIG.STAGGER.TIGHT
			});
	},

	/**
	 * Grid items entrance with random delay
	 */
	gridEntrance(items: HTMLElement[]): gsap.core.Timeline {
		if (!browser || !items.length) return gsap.timeline();
		
		return gsap.timeline()
			.fromTo(items, {
				opacity: 0,
				scale: 0.8,
				y: 30
			}, {
				opacity: 1,
				scale: 1,
				y: 0,
				duration: ANIMATION_CONFIG.NORMAL,
				ease: ANIMATION_CONFIG.EASING.SMOOTH,
				stagger: {
					amount: ANIMATION_CONFIG.STAGGER.LOOSE * items.length,
					from: "random"
				}
			});
	},

	/**
	 * Pagination animation
	 */
	paginationTransition(oldItems: HTMLElement[], newItems: HTMLElement[]): gsap.core.Timeline {
		if (!browser) return gsap.timeline();
		
		const timeline = gsap.timeline();
		
		// Fade out old items
		timeline.to(oldItems, {
			opacity: 0,
			y: -20,
			duration: ANIMATION_CONFIG.QUICK,
			ease: ANIMATION_CONFIG.EASING.SMOOTH,
			stagger: ANIMATION_CONFIG.STAGGER.TIGHT
		});
		
		// Fade in new items
		timeline.fromTo(newItems, {
			opacity: 0,
			y: 20
		}, {
			opacity: 1,
			y: 0,
			duration: ANIMATION_CONFIG.NORMAL,
			ease: ANIMATION_CONFIG.EASING.SMOOTH,
			stagger: ANIMATION_CONFIG.STAGGER.TIGHT
		}, "-=0.2");
		
		return timeline;
	}
};

/**
 * Form page animations
 */
export const formAnimations = {
	/**
	 * Form fields entrance
	 */
	fieldsEntrance(fields: HTMLElement[]): gsap.core.Timeline {
		if (!browser || !fields.length) return gsap.timeline();
		
		return gsap.timeline()
			.fromTo(fields, {
				opacity: 0,
				y: 20,
				scale: 0.98
			}, {
				opacity: 1,
				y: 0,
				scale: 1,
				duration: ANIMATION_CONFIG.NORMAL,
				ease: ANIMATION_CONFIG.EASING.SMOOTH,
				stagger: ANIMATION_CONFIG.STAGGER.NORMAL
			});
	},

	/**
	 * Field validation animation
	 */
	fieldValidation(field: HTMLElement, isValid: boolean): gsap.core.Timeline {
		if (!browser) return gsap.timeline();
		
		const timeline = gsap.timeline();
		
		if (isValid) {
			timeline.to(field, {
				borderColor: "#10b981", // green-500
				duration: ANIMATION_CONFIG.QUICK,
				ease: ANIMATION_CONFIG.EASING.SMOOTH
			});
		} else {
			timeline
				.to(field, {
					borderColor: "#ef4444", // red-500
					duration: ANIMATION_CONFIG.QUICK,
					ease: ANIMATION_CONFIG.EASING.SMOOTH
				})
				.to(field, {
					keyframes: {
						x: [0, -5, 5, -3, 3, 0]
					},
					duration: 0.4,
					ease: ANIMATION_CONFIG.EASING.SMOOTH
				});
		}
		
		return timeline;
	},

	/**
	 * Form submission animation
	 */
	submission(button: HTMLElement, form: HTMLElement): gsap.core.Timeline {
		if (!browser) return gsap.timeline();
		
		const timeline = gsap.timeline();
		
		// Button loading state
		timeline.to(button, {
			scale: 0.95,
			duration: ANIMATION_CONFIG.QUICK,
			ease: ANIMATION_CONFIG.EASING.SMOOTH
		});
		
		// Form slight scale
		timeline.to(form, {
			scale: 0.98,
			opacity: 0.8,
			duration: ANIMATION_CONFIG.QUICK,
			ease: ANIMATION_CONFIG.EASING.SMOOTH
		}, "-=0.1");
		
		return timeline;
	}
};

/**
 * Scroll-triggered animations for any page
 */
export const scrollAnimations = {
	/**
	 * Reveal elements on scroll
	 */
	revealOnScroll(elements: HTMLElement[]): ScrollTrigger[] {
		if (!browser || !elements.length) return [];
		
		return elements.map(element => 
			ScrollTrigger.create({
				trigger: element,
				start: "top 85%",
				end: "bottom 15%",
				once: true,
				animation: gsap.fromTo(element, {
					opacity: 0,
					y: 50
				}, {
					opacity: 1,
					y: 0,
					duration: ANIMATION_CONFIG.NORMAL,
					ease: ANIMATION_CONFIG.EASING.SMOOTH
				})
			})
		);
	},

	/**
	 * Parallax background elements
	 */
	parallaxBackground(element: HTMLElement, multiplier: number = 0.5): ScrollTrigger {
		if (!browser) return ScrollTrigger.create({});
		
		return ScrollTrigger.create({
			trigger: element,
			start: "top bottom",
			end: "bottom top",
			scrub: true,
			animation: gsap.fromTo(element, {
				y: `-${50 * multiplier}%`
			}, {
				y: `${50 * multiplier}%`,
				ease: "none"
			})
		});
	},

	/**
	 * Sticky header animation
	 */
	stickyHeader(header: HTMLElement): ScrollTrigger {
		if (!browser) return ScrollTrigger.create({});
		
		return ScrollTrigger.create({
			trigger: header,
			start: "top top",
			end: "bottom top",
			pin: true,
			pinSpacing: false,
			animation: gsap.fromTo(header, {
				backgroundColor: "rgba(0, 0, 0, 0)"
			}, {
				backgroundColor: "rgba(0, 0, 0, 0.9)",
				duration: ANIMATION_CONFIG.QUICK,
				ease: ANIMATION_CONFIG.EASING.SMOOTH
			})
		});
	}
};

/**
 * Page transition animations
 */
export const pageTransitions = {
	/**
	 * Slide transition between pages
	 */
	slide(
		exitingPage: HTMLElement,
		enteringPage: HTMLElement,
		direction: 'left' | 'right' = 'left'
	): gsap.core.Timeline {
		if (!browser) return gsap.timeline();
		
		const timeline = gsap.timeline();
		const exitX = direction === 'left' ? '-100%' : '100%';
		const enterX = direction === 'left' ? '100%' : '-100%';
		
		// Set initial state for entering page
		gsap.set(enteringPage, { x: enterX });
		
		// Slide both pages
		timeline
			.to(exitingPage, {
				x: exitX,
				duration: ANIMATION_CONFIG.SLOW,
				ease: ANIMATION_CONFIG.EASING.SMOOTH
			})
			.to(enteringPage, {
				x: '0%',
				duration: ANIMATION_CONFIG.SLOW,
				ease: ANIMATION_CONFIG.EASING.SMOOTH
			}, 0);
		
		return timeline;
	},

	/**
	 * Fade transition between pages
	 */
	fade(
		exitingPage: HTMLElement,
		enteringPage: HTMLElement
	): gsap.core.Timeline {
		if (!browser) return gsap.timeline();
		
		const timeline = gsap.timeline();
		
		// Set initial state
		gsap.set(enteringPage, { opacity: 0 });
		
		// Cross fade
		timeline
			.to(exitingPage, {
				opacity: 0,
				duration: ANIMATION_CONFIG.NORMAL,
				ease: ANIMATION_CONFIG.EASING.SMOOTH
			})
			.to(enteringPage, {
				opacity: 1,
				duration: ANIMATION_CONFIG.NORMAL,
				ease: ANIMATION_CONFIG.EASING.SMOOTH
			}, "-=0.2");
		
		return timeline;
	},

	/**
	 * Scale transition between pages
	 */
	scale(
		exitingPage: HTMLElement,
		enteringPage: HTMLElement
	): gsap.core.Timeline {
		if (!browser) return gsap.timeline();
		
		const timeline = gsap.timeline();
		
		// Set initial state
		gsap.set(enteringPage, { scale: 0.9, opacity: 0 });
		
		// Scale transition
		timeline
			.to(exitingPage, {
				scale: 1.1,
				opacity: 0,
				duration: ANIMATION_CONFIG.NORMAL,
				ease: ANIMATION_CONFIG.EASING.SMOOTH
			})
			.to(enteringPage, {
				scale: 1,
				opacity: 1,
				duration: ANIMATION_CONFIG.NORMAL,
				ease: ANIMATION_CONFIG.EASING.SMOOTH
			}, "-=0.3");
		
		return timeline;
	}
};

/**
 * Utility to batch multiple page animations
 */
export function createPageAnimationSequence(
	animationBatches: Array<{
		elements: HTMLElement[];
		animation: keyof typeof listPageAnimations | keyof typeof dashboardAnimations | 'custom';
		customAnimation?: (elements: HTMLElement[]) => gsap.core.Timeline;
		delay?: number;
	}>
): gsap.core.Timeline {
	if (!browser) return gsap.timeline();
	
	const masterTimeline = gsap.timeline();
	
	animationBatches.forEach(({ elements, animation, customAnimation, delay = 0 }) => {
		let animationTimeline: gsap.core.Timeline;
		
		if (animation === 'custom' && customAnimation) {
			animationTimeline = customAnimation(elements);
		} else if (animation in listPageAnimations) {
			// Type assertion since we know the key exists
			animationTimeline = (listPageAnimations as any)[animation](elements);
		} else if (animation in dashboardAnimations) {
			animationTimeline = (dashboardAnimations as any)[animation](elements);
		} else {
			animationTimeline = gsap.timeline();
		}
		
		masterTimeline.add(animationTimeline, delay);
	});
	
	return masterTimeline;
}
