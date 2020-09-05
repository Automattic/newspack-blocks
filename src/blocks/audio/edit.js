/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { Fragment, useEffect } from '@wordpress/element';
import { PanelBody, TextControl, Button } from '@wordpress/components';
import { InspectorControls } from '@wordpress/editor';
import { MediaUpload } from '@wordpress/block-editor';

/**
 * Internal dependencies
 */
import AudioPlayer from './AudioPlayer';
import enableAudioPlayers from './enableAudioPlayers';

/**
 * Style dependencies
 */
import './view.scss';

const Edit = ( { attributes, setAttributes } ) => {
	useEffect( () => {
		enableAudioPlayers();
	}, [ attributes.source, attributes.rssFeedUrl ] );

	return (
		<Fragment>
			<AudioPlayer attributes={ attributes } isInEditor />
			<InspectorControls>
				<PanelBody title={ __( 'RSS Feed' ) }>
					<TextControl
						label={ __( 'RSS Feed URL' ) }
						value={ attributes.rssFeedUrl }
						onChange={ value => setAttributes( { rssFeedUrl: value } ) }
					/>
					<TextControl
						label={ __( 'Subscribe link (e.g. Overcast, iTunes )' ) }
						value={ attributes.subscribeLink }
						onChange={ value => setAttributes( { subscribeLink: value } ) }
					/>
				</PanelBody>

				<PanelBody title={ __( 'Settings' ) } initialOpen={ false }>
					<TextControl
						label={ __( 'Source' ) }
						value={ attributes.source }
						onChange={ value => setAttributes( { source: value } ) }
					/>
					<MediaUpload
						onSelect={ media => setAttributes( { source: media.url } ) }
						allowedTypes={ [ 'audio' ] }
						value={ attributes.imageUrl }
						render={ ( { open } ) => (
							<Button isPrimary onClick={ open }>
								{ __( 'Add from media library' ) }
							</Button>
						) }
					/>

					<TextControl
						label={ __( 'Title' ) }
						value={ attributes.title }
						onChange={ value => setAttributes( { title: value } ) }
					/>
					<TextControl
						label={ __( 'Description' ) }
						value={ attributes.description }
						onChange={ value => setAttributes( { description: value } ) }
					/>

					{ attributes.imageUrl && (
						<Button
							onClick={ () => {
								setAttributes( { imageUrl: null } );
							} }
						>
							{ __( 'Remove image' ) }
						</Button>
					) }
					<MediaUpload
						onSelect={ media => setAttributes( { imageUrl: media.url } ) }
						allowedTypes={ [ 'image' ] }
						value={ attributes.imageUrl }
						render={ ( { open } ) => (
							<Button isPrimary onClick={ open }>
								{ attributes.imageUrl ? __( 'Change the image' ) : __( 'Add an image' ) }
							</Button>
						) }
					/>
				</PanelBody>
			</InspectorControls>
		</Fragment>
	);
};

export default Edit;
