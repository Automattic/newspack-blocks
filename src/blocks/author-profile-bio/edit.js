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
 * Truncate text to a specified length.
 *
 * @param {string} text   The text to truncate.
 * @param {number} length The maximum length.
 * @return {string} The truncated text.
 */
function truncateText( text, length ) {
	if ( ! text || text.length <= length ) {
		return text;
	}
	return text.substring( 0, length ).trim() + '…';
}

/**
 * Edit component for the Author Bio inner block.
 *
 * @param {Object}   props               Block props.
 * @param {Object}   props.attributes    Block attributes.
 * @param {Function} props.setAttributes Function to update attributes.
 * @return {JSX.Element} The edit component.
 */
export default function Edit( { attributes, setAttributes } ) {
	const author = useContext( AuthorContext );
	const { truncate, truncateLength } = attributes;

	const blockProps = useBlockProps( {
		className: 'wp-block-newspack-blocks-author-profile-bio',
	} );

	const bio = author?.bio || '';

	if ( ! bio ) {
		return (
			<div { ...blockProps }>
				<p className="author-bio-placeholder">{ __( 'Author bio will appear here.', 'newspack-blocks' ) }</p>
			</div>
		);
	}

	const displayBio = truncate ? truncateText( bio, truncateLength ) : bio;

	return (
		<>
			<InspectorControls>
				<PanelBody title={ __( 'Bio Settings', 'newspack-blocks' ) }>
					<ToggleControl
						label={ __( 'Truncate Bio', 'newspack-blocks' ) }
						checked={ truncate }
						onChange={ value => setAttributes( { truncate: value } ) }
						help={ __( 'Limit the bio to a certain number of characters.', 'newspack-blocks' ) }
					/>
					{ truncate && (
						<RangeControl
							label={ __( 'Maximum Characters', 'newspack-blocks' ) }
							value={ truncateLength }
							onChange={ value => setAttributes( { truncateLength: value } ) }
							min={ 50 }
							max={ 500 }
						/>
					) }
				</PanelBody>
			</InspectorControls>
			<div { ...blockProps }>
				<p dangerouslySetInnerHTML={ { __html: displayBio } } />
			</div>
		</>
	);
}
