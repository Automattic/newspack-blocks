/**
 * WordPress dependencies
 */
import { __, _x } from '@wordpress/i18n';
import {
	Button,
	Placeholder,
	ExternalLink,
	FormFileUpload,
	Spinner,
	Notice,
} from '@wordpress/components';
import { BlockIcon } from '@wordpress/block-editor';

const IframePlaceholder = ( {
	icon,
	label,
	onSubmit,
	value,
	onChange,
	isUploadingArchive,
	archiveFolder,
	setArchiveFile,
	error,
} ) => {
	const onUpload = event => {
		const files = event.target.files;
		if ( 0 < files.length ) {
			setArchiveFile( files.item( 0 ) );
		}
	};

	return (
		<Placeholder
			icon={ <BlockIcon icon={ icon } showColors /> }
			label={ label }
			className="wp-block-newspack-blocks-iframe"
			instructions={
				value
					? __( 'Update your iframe from URL', 'newspack-blocks' )
					: __( 'Insert your iframe from URL', 'newspack-blocks' )
			}
		>
			{ error && (
				<Notice status="error" isDismissible={ false }>
					{ error }
				</Notice>
			) }

			<form onSubmit={ onSubmit }>
				<input
					type="url"
					value={ value || '' }
					className="wp-block-newspack-blocks-iframe__input"
					aria-label={ label }
					placeholder={ __( 'Enter URL to embed here…' ) }
					onChange={ onChange }
				/>
				<Button isPrimary variant="primary" type="submit">
					{ _x( 'Embed', 'button label' ) }
				</Button>
			</form>

			<div>
				{ isUploadingArchive ? (
					<Spinner />
				) : (
					<FormFileUpload
						accept="application/zip"
						onChange={ onUpload }
						multiple={ false }
						render={ ( { openFileDialog } ) => (
							<div className="wp-block-newspack-blocks-iframe__archive-uploader">
								<span>{ __( 'or', 'newspack-blocks' ) }</span>
								<Button isSecondary onClick={ openFileDialog }>
									{ archiveFolder
										? __( 'update it with an assets folder (.zip)', 'newspack-blocks' )
										: __( 'upload an assets folder (.zip)', 'newspack-blocks' ) }
								</Button>
							</div>
						) }
					/>
				) }
			</div>
			<div className="wp-block-newspack-blocks-iframe__learn-more">
				<ExternalLink href={ __( 'https://newspack.pub/support/blocks/iframe-block/' ) }>
					{ __( 'Learn more about iframe block.' ) }
				</ExternalLink>
			</div>
		</Placeholder>
	);
};

export default IframePlaceholder;
