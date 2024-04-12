/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { Notice, Spinner, ToggleControl } from '@wordpress/components';

/**
 * Internal dependencies
 */
import type { NewsletterSubscriptionLists } from '../blocks/donate/types';

type Props = {
	attributes: {
		hideSubscriptionInput: boolean;
		lists: string[];
		newsletterSubscription: boolean;
	};
	setAttributes: ( attributes: Partial< Props[ 'attributes' ] > ) => void;
	inFlight: boolean;
	listsConfig: NewsletterSubscriptionLists;
};

const NewsletterSubscription = ( { attributes, setAttributes, inFlight, listsConfig }: Props ) => {
	const { hideSubscriptionInput, lists, newsletterSubscription } = attributes;
	return (
		<>
			<ToggleControl
				label={ __( 'Enable newsletter subscription', 'newspack-blocks' ) }
				checked={ !! attributes.newsletterSubscription }
				disabled={ inFlight }
				onChange={ () =>
					setAttributes( { newsletterSubscription: ! attributes.newsletterSubscription } )
				}
			/>
			{ newsletterSubscription && (
				<>
					{ ! inFlight && ! Object.keys( listsConfig ).length && (
						<div style={ { marginBottom: '1.5rem' } }>
							{ __(
								'To enable newsletter subscription, you must configure subscription lists on Newspack Newsletters.',
								'newspack-blocks'
							) }
						</div>
					) }
					{ inFlight || ! Object.keys( listsConfig ).length ? (
						<Spinner />
					) : (
						<>
							<ToggleControl
								label={ __( 'Hide newsletter selection and always subscribe', 'newspack-blocks' ) }
								checked={ hideSubscriptionInput }
								disabled={ inFlight || lists.length !== 1 }
								onChange={ () =>
									setAttributes( {
										hideSubscriptionInput: ! hideSubscriptionInput,
									} )
								}
							/>
							{ lists.length < 1 && (
								<div style={ { marginBottom: '1.5rem' } }>
									<Notice isDismissible={ false } status="error">
										{ __( 'You must select at least one list.', 'newspack-blocks' ) }
									</Notice>
								</div>
							) }
							<p>{ __( 'Lists', 'newspack-blocks' ) }:</p>
							{ Object.keys( listsConfig ).map( listId => (
								<ToggleControl
									key={ listId }
									label={ listsConfig[ listId ].title }
									checked={ lists.includes( listId ) }
									disabled={ inFlight }
									onChange={ () => {
										if ( ! lists.includes( listId ) ) {
											setAttributes( { lists: lists.concat( listId ) } );
										} else {
											setAttributes( {
												lists: lists.filter( id => id !== listId ),
											} );
										}
									} }
								/>
							) ) }
						</>
					) }
				</>
			) }
		</>
	);
};

export default NewsletterSubscription;
