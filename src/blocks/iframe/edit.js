import { Fragment, useState, useEffect } from 'react';
import { InspectorControls, BlockControls } from '@wordpress/block-editor';
import {
	PanelBody,
	TextControl,
	ToggleControl,
	Toolbar,
	FocusableIframe,
	Notice,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import IframePlaceholder from './iframe-placeholder';
import { iframeIcon } from './icons';
import apiFetch from '@wordpress/api-fetch';
import { Icon, layout } from '@wordpress/icons';

const IframeEdit = ( { attributes, setAttributes, isSelected } ) => {
	const label = __( 'Iframe', 'block title' );
	const { src, archiveFolder, isFullScreen, height, width } = attributes;
	const [ formSrc, setFormSrc ] = useState( src );
	const [ showPreview, setShowPreview ] = useState( true );
	const [ isUploadingArchive, setIsUploadingArchive ] = useState();
	const [ archiveFile, setArchiveFile ] = useState();
	const [ error, setError ] = useState();
	const [ removeCurrentArchiveFolder, setRemoveCurrentArchiveFolder ] = useState();

	const embedURL = event => {
		if ( event ) {
			event.preventDefault();
		}

		setError( null );
		setAttributes( { src: formSrc } );
		setShowPreview( true );

		// remove current archive folder if exists.
		if ( archiveFolder ) {
			setRemoveCurrentArchiveFolder( true );
		}
	};

	useEffect( () => {
		if ( archiveFile ) {
			uploadIframeArchive();
		}
	}, [ archiveFile ] );

	const uploadIframeArchive = async () => {
		setError( null );
		setIsUploadingArchive( true );

		try {
			const formData = new FormData();
			formData.append( 'archive_folder', archiveFolder );
			formData.append( 'archive_file', archiveFile );

			const { src: iframeArchiveSrc, dir: iframeArchiveFolder } = await apiFetch( {
				path: '/newspack-blocks/v1/newspack-blocks-iframe-archive',
				method: 'POST',
				body: formData,
			} );

			setAttributes( { src: iframeArchiveSrc, archiveFolder: iframeArchiveFolder } );
			setFormSrc( iframeArchiveSrc );
			setShowPreview( true );
		} catch ( e ) {
			setError(
				e.message ||
					e ||
					__( 'An error occured when uploading the iframe archive.', 'newspack-blocks' )
			);
		}

		setIsUploadingArchive( false );
	};

	useEffect( () => {
		// Do not remove archive if it's used (if a user clicks on embed after uploading the archive.)
		if ( removeCurrentArchiveFolder && src && archiveFolder && ! src.includes( archiveFolder ) ) {
			const formData = new FormData();
			formData.append( 'archive_folder', archiveFolder );

			apiFetch( {
				path: '/newspack-blocks/v1/newspack-blocks-remove-iframe-archive',
				method: 'POST',
				body: formData,
			} );

			setAttributes( { archiveFolder: null } );
			setRemoveCurrentArchiveFolder( false );
		}
	}, [
		src,
		archiveFolder,
		setArchiveFile,
		removeCurrentArchiveFolder,
		setRemoveCurrentArchiveFolder,
	] );

	const iframeControls = [
		{
			icon: <Icon icon={ layout } />,
			title: __( 'Show iframe preview', 'newspack-blocks' ),
			onClick: () => setShowPreview( ! showPreview ),
			isActive: src && showPreview,
		},
	];

	return (
		<Fragment>
			{ isFullScreen && (
				<Notice
					status="warning"
					className="wp-block-newspack-blocks-iframe-notice"
					isDismissible={ false }
				>
					{ __( 'This block will take over the page content.', 'newspack-blocks' ) }
				</Notice>
			) }
			{ src && ( ! isSelected || showPreview ) ? (
				<div className="iframe-container">
					<FocusableIframe
						title={ __( 'Newspack embedded iframe', 'newspack-blocks' ) }
						src={ src }
						style={ {
							width: isFullScreen ? '100vw' : width,
							height: isFullScreen ? '100vh' : height,
							'max-width': '100%',
							'max-height': '100%',
						} }
						onFocus={ () => setShowPreview( false ) }
					></FocusableIframe>
				</div>
			) : (
				<IframePlaceholder
					icon={ iframeIcon }
					label={ label }
					onSubmit={ embedURL }
					value={ formSrc }
					onChange={ event => setFormSrc( event.target.value ) }
					isUploadingArchive={ isUploadingArchive }
					archiveFolder={ archiveFolder }
					setArchiveFile={ setArchiveFile }
					error={ error }
				/>
			) }

			<BlockControls>
				<Toolbar controls={ iframeControls } />
			</BlockControls>

			<InspectorControls>
				<PanelBody title={ __( 'Iframe Settings', 'newspack-blocks' ) } initialOpen={ true }>
					<Fragment>
						<ToggleControl
							label={ __( 'Fullscreen', 'newspack-blocks' ) }
							help={ __(
								'If enabled, the iframe will be full screen and hide all the post content.',
								'newspack-blocks'
							) }
							checked={ isFullScreen }
							onChange={ _isFullScreen => setAttributes( { isFullScreen: _isFullScreen } ) }
							required
						/>

						{ ! isFullScreen && (
							<TextControl
								label={ __( 'Width', 'newspack-blocks' ) }
								value={ width }
								onChange={ _width => setAttributes( { width: _width } ) }
							/>
						) }

						{ ! isFullScreen && (
							<TextControl
								label={ __( 'Height', 'newspack-blocks' ) }
								value={ height }
								onChange={ _height => setAttributes( { height: _height } ) }
							/>
						) }
					</Fragment>
				</PanelBody>
			</InspectorControls>
		</Fragment>
	);
};

export default IframeEdit;
