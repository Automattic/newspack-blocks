/**
 * WordPress dependencies
 */
import { useContext } from '@wordpress/element';
import { useBlockProps, InspectorControls } from '@wordpress/block-editor';
import { PanelBody, ToggleControl } from '@wordpress/components';
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import { AuthorContext } from '../author-profile/context';

/**
 * Check if Newspack Author Custom Fields are available.
 *
 * @return {boolean} Whether custom fields are available.
 */
function hasCustomFields() {
	return !! window.newspack_blocks_data?.author_custom_fields?.length;
}

/**
 * Edit component for the Author Meta inner block.
 *
 * @param {Object}   props               Block props.
 * @param {Object}   props.attributes    Block attributes.
 * @param {Function} props.setAttributes Function to update attributes.
 * @return {JSX.Element} The edit component.
 */
export default function Edit( { attributes, setAttributes } ) {
	const author = useContext( AuthorContext );
	const { showJobTitle, showRole, showEmployer, showPhone } = attributes;

	const blockProps = useBlockProps( {
		className: 'wp-block-newspack-blocks-author-profile-meta',
	} );

	// If custom fields aren't available, show a notice.
	if ( ! hasCustomFields() ) {
		return (
			<div { ...blockProps }>
				<p className="meta-placeholder">{ __( 'Author meta fields require Newspack plugin.', 'newspack-blocks' ) }</p>
			</div>
		);
	}

	// Collect meta values to display.
	const metaItems = [];

	if ( showJobTitle && author?.newspack_job_title ) {
		metaItems.push( {
			key: 'job_title',
			value: author.newspack_job_title,
			className: 'author-profile-meta__job-title',
		} );
	}

	const employmentParts = [];
	if ( showRole && author?.newspack_role ) {
		employmentParts.push( author.newspack_role );
	}
	if ( showEmployer && author?.newspack_employer ) {
		employmentParts.push( author.newspack_employer );
	}
	if ( employmentParts.length > 0 ) {
		metaItems.push( {
			key: 'employment',
			value: employmentParts.join( ', ' ),
			className: 'author-profile-meta__employment',
		} );
	}

	if ( showPhone && author?.newspack_phone_number ) {
		// Phone number can be a string or an object with url/svg properties.
		const phoneValue =
			typeof author.newspack_phone_number === 'object' ? author.newspack_phone_number.url?.replace( 'tel:', '' ) : author.newspack_phone_number;
		if ( phoneValue ) {
			metaItems.push( {
				key: 'phone',
				value: phoneValue,
				className: 'author-profile-meta__phone',
			} );
		}
	}

	// Show placeholder if no meta to display.
	if ( metaItems.length === 0 ) {
		return (
			<>
				<InspectorControls>
					<PanelBody title={ __( 'Meta Settings', 'newspack-blocks' ) }>
						<ToggleControl
							label={ __( 'Show Job Title', 'newspack-blocks' ) }
							checked={ showJobTitle }
							onChange={ value => setAttributes( { showJobTitle: value } ) }
						/>
						<ToggleControl
							label={ __( 'Show Role', 'newspack-blocks' ) }
							checked={ showRole }
							onChange={ value => setAttributes( { showRole: value } ) }
						/>
						<ToggleControl
							label={ __( 'Show Employer', 'newspack-blocks' ) }
							checked={ showEmployer }
							onChange={ value => setAttributes( { showEmployer: value } ) }
						/>
						<ToggleControl
							label={ __( 'Show Phone Number', 'newspack-blocks' ) }
							checked={ showPhone }
							onChange={ value => setAttributes( { showPhone: value } ) }
						/>
					</PanelBody>
				</InspectorControls>
				<div { ...blockProps }>
					<p className="meta-placeholder">{ __( 'Author meta will appear here.', 'newspack-blocks' ) }</p>
				</div>
			</>
		);
	}

	return (
		<>
			<InspectorControls>
				<PanelBody title={ __( 'Meta Settings', 'newspack-blocks' ) }>
					<ToggleControl
						label={ __( 'Show Job Title', 'newspack-blocks' ) }
						checked={ showJobTitle }
						onChange={ value => setAttributes( { showJobTitle: value } ) }
					/>
					<ToggleControl
						label={ __( 'Show Role', 'newspack-blocks' ) }
						checked={ showRole }
						onChange={ value => setAttributes( { showRole: value } ) }
					/>
					<ToggleControl
						label={ __( 'Show Employer', 'newspack-blocks' ) }
						checked={ showEmployer }
						onChange={ value => setAttributes( { showEmployer: value } ) }
					/>
					<ToggleControl
						label={ __( 'Show Phone Number', 'newspack-blocks' ) }
						checked={ showPhone }
						onChange={ value => setAttributes( { showPhone: value } ) }
					/>
				</PanelBody>
			</InspectorControls>
			<div { ...blockProps }>
				{ metaItems.map( ( { key, value, className } ) => (
					<p key={ key } className={ className }>
						{ value }
					</p>
				) ) }
			</div>
		</>
	);
}
