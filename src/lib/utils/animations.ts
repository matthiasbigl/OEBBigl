/**
 * Animation utilities index
 * Central export point for all animation utilities
 */

// Core page animations
export {
	createPageAnimations,
	createFadeInAnimation,
	createSlideAnimation,
	createStaggeredGridAnimation,
	createButtonAnimations,
	animateFilterToggle,
	createLoadingAnimation,
	createPageTransition,
	createScrollAnimation,
	addHoverEffects,
	createMorphingBackground,
	cleanupElementAnimations,
	createBatchAnimation,
	ANIMATION_CONFIG,
	ANIMATION_PRESETS,
	type AnimationController,
	type AnimationElements
} from './pageAnimations';

// Component-specific animations
export {
	departureAnimations,
	filterAnimations,
	searchAnimations,
	loadingAnimations,
	messageAnimations,
	modalAnimations,
	collapsibleAnimations,
	timeAnimations,
	navigationAnimations,
	cleanupComponentAnimations,
	prefersReducedMotion,
	respectMotionPreference
} from './componentAnimations';

// Page-specific animations
export {
	landingPageAnimations,
	dashboardAnimations,
	listPageAnimations,
	formAnimations,
	scrollAnimations,
	pageTransitions,
	createPageAnimationSequence
} from './pageSpecificAnimations';

// Re-export commonly used functions with shorter names for convenience
export {
	createPageAnimations as usePageAnimations,
	createFadeInAnimation as useFadeIn,
	createSlideAnimation as useSlideIn,
	createStaggeredGridAnimation as useStaggeredGrid
} from './pageAnimations';

export {
	departureAnimations as useDepartureAnimations,
	filterAnimations as useFilterAnimations,
	searchAnimations as useSearchAnimations,
	collapsibleAnimations as useCollapsibleAnimations
} from './componentAnimations';

/**
 * Quick animation helpers for common use cases
 */
import { 
	createFadeInAnimation, 
	createSlideAnimation, 
	createButtonAnimations, 
	createLoadingAnimation, 
	cleanupElementAnimations 
} from './pageAnimations';
import { 
	departureAnimations,
	filterAnimations,
	searchAnimations,
	timeAnimations
} from './componentAnimations';

export const quickAnimations = {
	// Quick entrance animations
	fadeIn: (element: HTMLElement | HTMLElement[]) => 
		createFadeInAnimation(element, { duration: 0.3 }),
	
	slideUp: (element: HTMLElement | HTMLElement[]) => 
		createSlideAnimation(element, 'up', { duration: 0.4 }),
	
	// Quick interaction animations
	buttonPress: (element: HTMLElement) => {
		const { press, release } = createButtonAnimations(element);
		press();
		setTimeout(release, 100);
	},
	
	// Quick loading states
	pulse: (element: HTMLElement) => 
		createLoadingAnimation(element),
	
	// Quick cleanup
	cleanup: (...elements: (HTMLElement | null)[]) => 
		cleanupElementAnimations(elements),
	
	// Component-specific quick animations
	filterToggle: (element: HTMLElement, isActive: boolean) => 
		filterAnimations.activate(element),
		
	timeUpdate: (element: HTMLElement) => 
		timeAnimations.update(element),
		
	departureEntrance: (cards: HTMLElement[]) => 
		departureAnimations.entranceStagger(cards),
		
	searchFocus: (element: HTMLElement) => 
		searchAnimations.inputFocus(element),
		
	searchBlur: (element: HTMLElement) => 
		searchAnimations.inputBlur(element)
};

/**
 * Animation presets for common UI patterns
 */
export const animationPresets = {
	// Card animations
	card: {
		hover: { scale: 1.02, y: -2, duration: 0.2 },
		press: { scale: 0.98, duration: 0.1 },
		entrance: { opacity: [0, 1], y: [20, 0], duration: 0.4 }
	},
	
	// Button animations
	button: {
		hover: { scale: 1.05, duration: 0.2 },
		press: { scale: 0.95, duration: 0.1 },
		loading: { opacity: [1, 0.5], duration: 1, repeat: -1, yoyo: true }
	},
	
	// Modal animations
	modal: {
		entrance: { opacity: [0, 1], scale: [0.9, 1], duration: 0.3 },
		exit: { opacity: [1, 0], scale: [1, 0.9], duration: 0.2 }
	},
	
	// Page transitions
	page: {
		fadeIn: { opacity: [0, 1], duration: 0.5 },
		slideIn: { x: ['100%', '0%'], duration: 0.5 },
		scaleIn: { scale: [0.9, 1], opacity: [0, 1], duration: 0.4 }
	}
};
