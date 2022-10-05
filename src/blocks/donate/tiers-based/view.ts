const BUTTON_ACTIVE_CLASSNAME = 'wpbnbd__tiers__selection__item--active';

const getSelectedAmountSelector = ( frequency: string ) =>
	`.wpbnbd__tiers__amount [data-frequency-slug="${ frequency }"]`;

export default ( parentEl: HTMLElement ) => {
	const buttonsEls = parentEl.querySelectorAll( '.wpbnbd__tiers__selection button' );
	const amountsEls: NodeListOf< HTMLElement > = parentEl.querySelectorAll(
		'.wpbnbd__tiers__amount [data-frequency-slug]'
	);
	const params = {
		frequency: parentEl.getAttribute( 'data-param-freq' ),
		tierPrefix: parentEl.getAttribute( 'data-param-tier-prefix' ),
	};
	const frequencyInputEl = parentEl.querySelector( `input[name="${ params.frequency }"]` );
	if ( ! buttonsEls || ! amountsEls || ! frequencyInputEl ) {
		return;
	}

	let selectedFrequency = parentEl.getAttribute( 'data-init-frequency' );

	// Frequency buttons.
	buttonsEls.forEach( buttonEl => {
		buttonEl.addEventListener( 'click', () => {
			selectedFrequency = buttonEl.getAttribute( 'data-frequency-slug' );
			if ( ! selectedFrequency ) {
				return;
			}

			frequencyInputEl.setAttribute( 'value', selectedFrequency );
			amountsEls.forEach( amountEl => ( amountEl.style.display = 'none' ) );
			const selectedAmountEls: NodeListOf< HTMLElement > = document.querySelectorAll(
				getSelectedAmountSelector( selectedFrequency )
			);
			selectedAmountEls.forEach(
				selectedAmountEl => ( selectedAmountEl.style.display = 'inline' )
			);
			buttonsEls.forEach( ( _buttonEl: Element ) =>
				_buttonEl.classList.remove( BUTTON_ACTIVE_CLASSNAME )
			);
			buttonEl.classList.add( BUTTON_ACTIVE_CLASSNAME );

			// Update the value in the form's submit buttons.
			const submitButtonsEls = parentEl.querySelectorAll( 'button[type="submit"]' );
			submitButtonsEls.forEach( ( _buttonEl: Element ) => {
				if ( ! selectedFrequency ) {
					return;
				}
				_buttonEl.setAttribute( 'name', `${ params.tierPrefix }${ selectedFrequency }` );
				const buttonTierIndex = _buttonEl.getAttribute( 'data-tier-index' );
				const amountEl = document.querySelector(
					`${ getSelectedAmountSelector(
						selectedFrequency
					) }[data-tier-index="${ buttonTierIndex }"]`
				);
				if ( ! amountEl ) {
					return;
				}
				const value = amountEl.getAttribute( 'data-amount' );
				if ( value ) {
					_buttonEl.setAttribute( 'value', value );
				}
			} );
		} );
	} );
};
