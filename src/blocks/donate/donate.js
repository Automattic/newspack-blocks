export default function donateBlock(
	container = '.wp-block-newspack-blocks-donate',
	is_admin = false
) {

	container.addEventListener( 'click', e => {
		if ( e.target.parentNode.parentNode.classList.contains( 'term' ) ) {
			const li = e.target.parentNode;
			li.parentNode.childNodes.forEach( node =>
				node.classList.toggle( 'is-selected', node === li )
			);
			e.preventDefault();
		}
		if ( e.target.parentNode.parentNode.classList.contains( 'levels' ) ) {
			const li = e.target.parentNode;
			amount.value = parseInt( li.getAttribute( 'data-minimum' ) );
			amountChanged( amount.value );
			// setTier( li.getAttribute( 'data-tier' ) );
			e.preventDefault();
		}
	} )

	const amount = container.querySelector( 'input[type=text]' );

	const setTier = tier => {
		console.log( 'set tier', tier );
		container
			.querySelectorAll( '.levels > li' )
			.forEach( li =>
				li.classList.toggle( 'is-selected', tier === li.getAttribute( 'data-tier' ) )
			);
	};
	const amountChanged = amount => {
		let tier = null;
		container.querySelectorAll( '.levels > li' ).forEach( node => {
			if ( parseInt( node.getAttribute( 'data-minimum' ) ) <= amount ) {
				tier = node.getAttribute( 'data-tier' );
				container.querySelector( 'span.tier-name' ).innerText = node.getAttribute( 'data-title' );
			}
		} );
		setTier( tier );
	};
	const getMinimums = () => {
		const minimums = {};
		container.querySelectorAll( '.levels > li' ).forEach( node => {
			minimums[ node.getAttribute( 'data-tier' ) ] = parseInt(
				node.getAttribute( 'data-minimum' )
			);
		} );
		return minimums;
	};
	amount.addEventListener( 'change', e => {
		amountChanged( e.target.value );
	} );
	if ( is_admin ) {
		container.querySelector( 'button.primary' ).addEventListener( 'click', e => {
			alert( 'You are in the WordPress editor. Form will not be submitted' );
			e.preventDefault();
		} );
	}
	const minimums = getMinimums();
	const sorted = Object.values( minimums ).sort( ( a, b ) => a - b );
	amount.value = sorted[ 0 ] || 0;
	amountChanged( amount.value );
}
