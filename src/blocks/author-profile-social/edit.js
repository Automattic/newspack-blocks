/**
 * WordPress dependencies
 */
import { useContext } from '@wordpress/element';
import { useBlockProps, InspectorControls } from '@wordpress/block-editor';
import { PanelBody, RangeControl, ToggleControl } from '@wordpress/components';
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import { AuthorContext } from '../author-profile/context';

/**
 * Edit component for the Author Social Links inner block.
 *
 * @param {Object}   props               Block props.
 * @param {Object}   props.attributes    Block attributes.
 * @param {Function} props.setAttributes Function to update attributes.
 * @return {JSX.Element} The edit component.
 */
export default function Edit( { attributes, setAttributes } ) {
	const author = useContext( AuthorContext );
	const { showEmail, iconSize } = attributes;

	const blockProps = useBlockProps( {
		className: 'wp-block-newspack-blocks-author-profile-social',
		style: {
			'--icon-size': `${ iconSize }px`,
		},
	} );

	// Build social links array.
	const socialLinks = [];

	if ( author?.social ) {
		Object.entries( author.social ).forEach( ( [ service, data ] ) => {
			if ( data?.url ) {
				socialLinks.push( {
					service,
					url: data.url,
					svg: data.svg || null,
				} );
			}
		} );
	}

	// Add email if enabled.
	// Email can be an object {url, svg} or a string from the API.
	if ( showEmail && author?.email ) {
		const emailData = typeof author.email === 'object' ? author.email : { url: `mailto:${ author.email }` };
		socialLinks.push( {
			service: 'email',
			url: emailData.url,
			svg: emailData.svg || null,
		} );
	}

	if ( socialLinks.length === 0 ) {
		return (
			<div { ...blockProps }>
				<p className="social-links-placeholder">{ __( 'Social links will appear here.', 'newspack-blocks' ) }</p>
			</div>
		);
	}

	return (
		<>
			<InspectorControls>
				<PanelBody title={ __( 'Social Links Settings', 'newspack-blocks' ) }>
					<ToggleControl
						label={ __( 'Show Email', 'newspack-blocks' ) }
						checked={ showEmail }
						onChange={ value => setAttributes( { showEmail: value } ) }
						help={ __( "Display the author's email address as a link.", 'newspack-blocks' ) }
					/>
					<RangeControl
						label={ __( 'Icon Size', 'newspack-blocks' ) }
						value={ iconSize }
						onChange={ value => setAttributes( { iconSize: value } ) }
						min={ 16 }
						max={ 48 }
					/>
				</PanelBody>
			</InspectorControls>
			<div { ...blockProps }>
				<ul className="author-profile-social__list">
					{ socialLinks.map( ( { service, url, svg } ) => (
						<li key={ service }>
							<a href={ url } className="no-op">
								{ svg ? (
									<span dangerouslySetInnerHTML={ { __html: svg } } style={ { width: iconSize, height: iconSize } } />
								) : (
									<span className="service-name">{ service }</span>
								) }
							</a>
						</li>
					) ) }
				</ul>
			</div>
		</>
	);
}
