# Animation System Documentation

This comprehensive animation system provides reusable, consistent animations across your entire application using GSAP. The system is designed with modularity and reusability in mind.

## Architecture Overview

```
lib/utils/
├── animations.ts              # Main export index
├── pageAnimations.ts          # Core page-level animations
├── componentAnimations.ts     # Component-specific animations
└── pageSpecificAnimations.ts  # Page-type specific animations
```

## Quick Start

### Basic Import
```typescript
import { usePageAnimations, useFadeIn, useFilterAnimations } from '$lib/utils/animations';
```

### Advanced Import
```typescript
import { 
	createPageAnimations, 
	departureAnimations, 
	ANIMATION_CONFIG 
} from '$lib/utils/animations';
```

## Core Animation System

### 1. Page Animations (`pageAnimations.ts`)

Main system for complex page-level animations like entrance sequences and parallax effects.

```typescript
import { createPageAnimations } from '$lib/utils/animations';

// In your page component
let pageAnimationController: AnimationController | null = null;

onMount(() => {
	if (browser && headerRef && searchContainer) {
		pageAnimationController = createPageAnimations({
			pageContainer,
			headerRef,
			gridBackground,
			searchContainer,
			stationContainer,
			departuresContainer
		});
		
		pageAnimationController.initialize();
	}
});

onDestroy(() => {
	pageAnimationController?.cleanup();
});
```

### 2. Component Animations (`componentAnimations.ts`)

Reusable animations for specific UI components.

#### Departure Cards
```typescript
import { departureAnimations } from '$lib/utils/animations';

// Animate cards entering
departureAnimations.entranceStagger(cardElements);

// Animate time updates
departureAnimations.timeUpdate(timeElement);

// Animate delay indicators
departureAnimations.delayIndicator(delayElement);
```

#### Filter Components
```typescript
import { filterAnimations } from '$lib/utils/animations';

// Animate filter buttons appearing
filterAnimations.buttonEntrance(buttonElements);

// Animate filter activation
filterAnimations.activate(buttonElement);

// Animate clearing filters
filterAnimations.clear(allFilterElements);
```

#### Search Components
```typescript
import { searchAnimations } from '$lib/utils/animations';

// Animate search suggestions
searchAnimations.suggestionsEntrance(container, suggestionItems);

// Input focus/blur animations
searchAnimations.inputFocus(inputElement);
searchAnimations.inputBlur(inputElement);
```

### 3. Page-Specific Animations (`pageSpecificAnimations.ts`)

Templates for different page types and common page patterns.

#### Landing Page
```typescript
import { landingPageAnimations } from '$lib/utils/animations';

// Hero section animation
landingPageAnimations.heroEntrance(titleElement, subtitleElement, ctaElement);

// Feature cards
landingPageAnimations.featureCards(cardElements);
```

#### Dashboard
```typescript
import { dashboardAnimations } from '$lib/utils/animations';

// Widget entrance
dashboardAnimations.widgetEntrance(widgetElements);

// Count-up animation
dashboardAnimations.countUp(counterElement, 0, 1000);

// Chart reveal
dashboardAnimations.chartReveal(chartContainer);
```

#### Lists/Grids
```typescript
import { listPageAnimations } from '$lib/utils/animations';

// List items entrance
listPageAnimations.itemsEntrance(listItems);

// Grid entrance with random stagger
listPageAnimations.gridEntrance(gridItems);

// Pagination transition
listPageAnimations.paginationTransition(oldItems, newItems);
```

## Common Patterns

### 1. Component Mount Animation
```typescript
import { useFadeIn } from '$lib/utils/animations';

onMount(() => {
	if (browser && containerRef) {
		useFadeIn(containerRef, { duration: 0.6 });
	}
});
```

### 2. Filter Button Animation
```typescript
import { useFilterAnimations } from '$lib/utils/animations';

// In your filter component
onMount(() => {
	if (browser && filterButtons.length) {
		useFilterAnimations.buttonEntrance(filterButtons);
	}
});

// On filter toggle
const handleFilterToggle = (button: HTMLElement) => {
	useFilterAnimations.activate(button);
	// ... filter logic
};
```

### 3. Departure Cards
```typescript
import { useDepartureAnimations } from '$lib/utils/animations';

// When new departures arrive
$: if (departureElements.length && browser) {
	useDepartureAnimations.entranceStagger(departureElements);
}

// When time updates
const updateTime = (element: HTMLElement) => {
	useDepartureAnimations.timeUpdate(element);
};
```

### 4. Modal/Dialog Animation
```typescript
import { modalAnimations } from '$lib/utils/animations';

// Opening modal
const openModal = () => {
	modalAnimations.entrance(backdropElement, modalElement);
};

// Closing modal
const closeModal = () => {
	return modalAnimations.exit(backdropElement, modalElement);
};
```

### 5. Page Transitions
```typescript
import { pageTransitions } from '$lib/utils/animations';

// Between page navigation
const navigateWithTransition = (newPageElement: HTMLElement) => {
	pageTransitions.fade(currentPageElement, newPageElement);
};
```

## Configuration

### Animation Timing
```typescript
import { ANIMATION_CONFIG } from '$lib/utils/animations';

// Available timing constants
ANIMATION_CONFIG.QUICK     // 0.3s - for micro-interactions
ANIMATION_CONFIG.NORMAL    // 0.6s - for standard animations
ANIMATION_CONFIG.SLOW      // 1.0s - for dramatic effects
```

### Easing Curves
```typescript
ANIMATION_CONFIG.EASING.SMOOTH    // power2.out - smooth transitions
ANIMATION_CONFIG.EASING.BOUNCE    // back.out(1.7) - bouncy effect
ANIMATION_CONFIG.EASING.ELASTIC   // elastic.out(1, 0.3) - elastic effect
```

### Stagger Timing
```typescript
ANIMATION_CONFIG.STAGGER.TIGHT    // 0.05s - tight stagger
ANIMATION_CONFIG.STAGGER.NORMAL   // 0.1s - normal stagger
ANIMATION_CONFIG.STAGGER.LOOSE    // 0.2s - loose stagger
```

## Accessibility

### Reduced Motion
The system automatically respects user's motion preferences:

```typescript
import { respectMotionPreference } from '$lib/utils/animations';

// Wrap animations to respect user preferences
const animateWithRespect = respectMotionPreference(
	(element) => useFadeIn(element),
	() => {
		// Fallback for reduced motion - just show the element
		element.style.opacity = '1';
	}
);
```

### Check Motion Preference
```typescript
import { prefersReducedMotion } from '$lib/utils/animations';

if (!prefersReducedMotion()) {
	// Only animate if user allows motion
	useFadeIn(element);
}
```

## Quick Utilities

### Quick Animations
```typescript
import { quickAnimations } from '$lib/utils/animations';

// Quick fade in
quickAnimations.fadeIn(element);

// Quick slide up
quickAnimations.slideUp(elements);

// Quick button press
quickAnimations.buttonPress(buttonElement);

// Quick cleanup
quickAnimations.cleanup(element1, element2, element3);
```

### Animation Presets
```typescript
import { animationPresets } from '$lib/utils/animations';

// Use predefined animation values
gsap.to(element, animationPresets.button.hover);
gsap.to(element, animationPresets.card.entrance);
```

## Best Practices

### 1. Always Cleanup
```typescript
onDestroy(() => {
	animationController?.cleanup();
	quickAnimations.cleanup(element1, element2);
});
```

### 2. Browser Guards
```typescript
if (browser && element) {
	// Only animate in browser
	useFadeIn(element);
}
```

### 3. Element Existence Checks
```typescript
if (element && element.offsetParent !== null) {
	// Element exists and is visible
	useFadeIn(element);
}
```

### 4. Performance
```typescript
// Use will-change for better performance
element.style.willChange = 'transform, opacity';

// Remove will-change after animation
gsap.set(element, { willChange: 'auto', clearProps: 'all' });
```

## Examples for Your App

### Station Search Component
```typescript
import { searchAnimations } from '$lib/utils/animations';

// When suggestions appear
$: if (suggestions.length && suggestionsContainer) {
	searchAnimations.suggestionsEntrance(suggestionsContainer, suggestionElements);
}
```

### Departure List
```typescript
import { departureAnimations } from '$lib/utils/animations';

// When departures update
$: if (departureCards.length && browser) {
	departureAnimations.entranceStagger(departureCards);
}

// Real-time updates
const updateDeparture = (element: HTMLElement) => {
	departureAnimations.timeUpdate(element);
};
```

### Filter Components
```typescript
import { filterAnimations } from '$lib/utils/animations';

onMount(() => {
	if (browser && filterButtons.length) {
		filterAnimations.buttonEntrance(filterButtons);
	}
});

const handleFilterToggle = (button: HTMLElement) => {
	filterAnimations.activate(button);
};
```

This system provides consistent, performant, and accessible animations across your entire application while being highly modular and reusable!
