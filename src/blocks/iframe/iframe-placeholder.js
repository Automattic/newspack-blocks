/**
 * WordPress dependencies
 */
import { useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { Button, Placeholder, FormFileUpload, Spinner, Notice } from '@wordpress/components';
import { BlockIcon, URLPopover, MediaUpload } from '@wordpress/block-editor';
import { keyboardReturn } from '@wordpress/icons';

/**
 * External dependencies
 */
import classnames from 'classnames';

const InsertFromURLPopover = ( { src, onChange, onSubmit, onClose } ) => (
	<URLPopover onClose={ onClose }>
		<form className="wp-block-newspack-blocks-iframe__url-input-form" onSubmit={ onSubmit }>
			<input
				className="wp-block-newspack-blocks-iframe__url-input-form__url-input-field"
				type="url"
				aria-label={ __( 'URL' ) }
				placeholder={ __( 'Paste or type URL' ) }
				onChange={ onChange }
				value={ src }
			/>
			<Button
				className="wp-block-newspack-blocks-iframe__url-input-form__url-input-submit-button"
				icon={ keyboardReturn }
				label={ __( 'Apply' ) }
				type="submit"
			/>
		</form>
	</URLPopover>
);

const IframePlaceholder = ( {
	icon,
	label,
	src,
	setFormSrc,
	onSelectURL,
	onSelectMedia,
	isUploadingArchive,
	archiveFolder,
	setArchiveFile,
	error,
} ) => {
	const [ isURLInputVisible, setIsURLInputVisible ] = useState( false );

	// URL text field
	const onChangeSrc = event => {
		setFormSrc( event.target.value );
	};

	const openURLInput = () => {
		setIsURLInputVisible( true );
	};
	const closeURLInput = () => {
		setIsURLInputVisible( false );
	};

	const onSubmitSrc = event => {
		event.preventDefault();
		if ( src && onSelectURL ) {
			onSelectURL( src );
			closeURLInput();
		}
	};

	const onSelectImage = media => {
		onSelectMedia( media.id );
	};

	// Uploader
	const onUpload = event => {
		const files = event.target.files;
		if ( 0 < files.length ) {
			setArchiveFile( files.item( 0 ) );
		}
	};

	const renderMediaLibraryButton = onSelect => {
		return (
			<MediaUpload
				onSelect={ onSelect }
				allowedTypes="application/zip"
				render={ ( { open } ) => {
					return (
						<Button variant="tertiary" onClick={ open }>
							{ __( 'Media Library', 'newspack-blocks' ) }
						</Button>
					);
				} }
			/>
		);
	};

	const renderUrlSelectionUI = isUpdate => {
		return (
			onSelectURL && (
				<div className="wp-block-newspack-blocks-iframe__url-input-container">
					<Button
						isTertiary
						onClick={ openURLInput }
						isPressed={ isURLInputVisible }
						variant="tertiary"
					>
						{ isUpdate
							? __( 'Update from URL', 'newspack-blocks' )
							: __( 'Embed from URL', 'newspack-blocks' ) }
					</Button>
					{ isURLInputVisible && (
						<InsertFromURLPopover
							src={ src }
							onChange={ onChangeSrc }
							onSubmit={ onSubmitSrc }
							onClose={ closeURLInput }
						/>
					) }
				</div>
			)
		);
	};

	return (
		<Placeholder
			icon={ <BlockIcon icon={ icon } showColors /> }
			label={ label }
			className="wp-block-newspack-blocks-iframe"
			instructions={ __(
				'Upload an asset folder (.zip), pick one from your media library, or add one with a URL.',
				'newspack-blocks'
			) }
		>
			{ error && (
				<Notice
					status="error"
					className="wp-block-newspack-blocks-iframe-notice"
					isDismissible={ false }
				>
					{ error }
				</Notice>
			) }

			<div>
				{ isUploadingArchive ? (
					<Spinner />
				) : (
					<FormFileUpload
						accept="application/zip"
						onChange={ onUpload }
						multiple={ false }
						render={ ( { openFileDialog } ) => (
							<>
								<Button
									isPrimary
									className={ classnames(
										'wp-block-newspack-blocks-iframe__button',
										'wp-block-newspack-blocks-iframe__upload-button'
									) }
									onClick={ openFileDialog }
								>
									{ archiveFolder
										? __( 'Update', 'newspack-blocks' )
										: __( 'Upload', 'newspack-blocks' ) }
								</Button>
								{ renderMediaLibraryButton( onSelectImage ) }
								{ renderUrlSelectionUI( '' !== archiveFolder ) }
							</>
						) }
					/>
				) }
			</div>
		</Placeholder>
	);
};

export default IframePlaceholder;
