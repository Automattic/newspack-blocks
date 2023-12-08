/**
 * Internal dependencies
 */
import './style.scss';

/**
 * Specify a function to execute when the DOM is fully loaded.
 *
 * @see https://github.com/WordPress/gutenberg/blob/trunk/packages/dom-ready/
 *
 * @param {Function} callback A function to execute after the DOM is ready.
 * @return {void}
 */
function domReady( callback: () => void ): void {
	if ( typeof document === 'undefined' ) {
		return;
	}
	if (
		document.readyState === 'complete' || // DOMContentLoaded + Images/Styles/etc loaded, so we call directly.
		document.readyState === 'interactive' // DOMContentLoaded fires at this point, so we call directly.
	) {
		return void callback();
	}
	// DOMContentLoaded has not fired yet, delay callback until then.
	document.addEventListener( 'DOMContentLoaded', callback );
}

const handleOtherValue = ( container: HTMLElement ) => {
	const frequencies = container.querySelectorAll( '.tiers' );
	if ( ! frequencies?.length ) {
		return;
	}
	const frequencyInputs = container.querySelectorAll( 'input[name="donation_frequency"]' );
	const submitButton = container.querySelector( 'button[type="submit"]' );
	frequencies.forEach( frequency => {
		const tiers = frequency.querySelectorAll( 'input[type="radio"]' );
		const input = <HTMLInputElement>frequency.querySelector( '.money-input input' );
		if ( ! tiers?.length || ! input ) {
			return;
		}
		const originalValue = input.getAttribute( 'value' );
		const reset = () => {
			input.value = originalValue || '';
		};
		const toggleSubmit = () => {
			const checkedTier = <HTMLInputElement>(
				frequency.querySelector( 'input[type="radio"]:checked' )
			);
			if ( ! checkedTier ) {
				return;
			}
			if ( checkedTier.value === 'other' && ! input.value ) {
				submitButton?.setAttribute( 'disabled', 'disabled' );
			} else {
				submitButton?.removeAttribute( 'disabled' );
			}
		};
		input.addEventListener( 'keyup', toggleSubmit );
		toggleSubmit();
		tiers.forEach( tierInput => {
			tierInput.addEventListener( 'change', reset );
			tierInput.addEventListener( 'change', toggleSubmit );
		} );
		frequencyInputs.forEach( frequencyInput => {
			frequencyInput.addEventListener( 'change', reset );
			frequencyInput.addEventListener( 'change', toggleSubmit );
		} );
	} );
};

export const processFrequencyBasedElements = ( parentEl = document ) => {
	const elements = parentEl.querySelectorAll(
		'.wpbnbd--frequency-based'
	) as NodeListOf< HTMLElement >;
	elements.forEach( container => {
		handleOtherValue( container );
	} );
};

if ( typeof window !== 'undefined' ) {
	domReady( () => processFrequencyBasedElements() );
}
