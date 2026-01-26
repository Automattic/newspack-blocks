/**
 * WordPress dependencies
 */
import { useContext } from '@wordpress/element';
import { useBlockProps, InspectorControls } from '@wordpress/block-editor';
import { PanelBody, TextControl } from '@wordpress/components';
import { __, sprintf } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import { AuthorContext } from '../author-profile/context';

/**
 * Edit component for the Author Archive Link inner block.
 *
 * @param {Object}   props               Block props.
 * @param {Object}   props.attributes    Block attributes.
 * @param {Function} props.setAttributes Function to update attributes.
 * @return {JSX.Element} The edit component.
 */
export default function Edit( { attributes, setAttributes } ) {
	const author = useContext( AuthorContext );
	const { label } = attributes;

	const blockProps = useBlockProps( {
		className: 'wp-block-newspack-blocks-author-profile-archive-link',
	} );

	const authorName = author?.name || __( 'Author', 'newspack-blocks' );
	const authorUrl = author?.url || '#';

	// Format the label with author name.
	const displayLabel = label.includes( '%s' ) ? sprintf( label, authorName ) : label;

	if ( ! author?.url ) {
		return (
			<div { ...blockProps }>
				<p className="archive-link-placeholder">{ __( 'Archive link will appear here.', 'newspack-blocks' ) }</p>
			</div>
		);
	}

	return (
		<>
			<InspectorControls>
				<PanelBody title={ __( 'Archive Link Settings', 'newspack-blocks' ) }>
					<TextControl
						label={ __( 'Link Text', 'newspack-blocks' ) }
						value={ label }
						onChange={ value => setAttributes( { label: value } ) }
						// translators: %s is placeholder text that will be replaced with the author name.
						help={ __( 'Use %s as a placeholder for the author name.', 'newspack-blocks' ) }
					/>
				</PanelBody>
			</InspectorControls>
			<div { ...blockProps }>
				<a href={ authorUrl } className="no-op">
					{ displayLabel }
				</a>
			</div>
		</>
	);
}
