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
 * Edit component for the Author Name inner block.
 *
 * @param {Object}   props               Block props.
 * @param {Object}   props.attributes    Block attributes.
 * @param {Function} props.setAttributes Function to update attributes.
 * @return {JSX.Element} The edit component.
 */
export default function Edit( { attributes, setAttributes } ) {
	const author = useContext( AuthorContext );
	const { headingLevel, linkToArchive } = attributes;

	const blockProps = useBlockProps( {
		className: 'wp-block-newspack-blocks-author-profile-name',
	} );

	const HeadingTag = `h${ headingLevel }`;
	const displayName = author?.name || __( 'Author Name', 'newspack-blocks' );
	const archiveUrl = author?.url || '#';

	return (
		<>
			<InspectorControls>
				<PanelBody title={ __( 'Name Settings', 'newspack-blocks' ) }>
					<RangeControl
						label={ __( 'Heading Level', 'newspack-blocks' ) }
						value={ headingLevel }
						onChange={ value => setAttributes( { headingLevel: value } ) }
						min={ 1 }
						max={ 6 }
					/>
					<ToggleControl
						label={ __( 'Link to Author Archive', 'newspack-blocks' ) }
						checked={ linkToArchive }
						onChange={ value => setAttributes( { linkToArchive: value } ) }
					/>
				</PanelBody>
			</InspectorControls>
			<div { ...blockProps }>
				<HeadingTag className="author-profile-name__heading">
					{ linkToArchive ? (
						<a href={ archiveUrl } className="no-op">
							{ displayName }
						</a>
					) : (
						displayName
					) }
				</HeadingTag>
			</div>
		</>
	);
}
