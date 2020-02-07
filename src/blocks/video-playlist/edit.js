/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import apiFetch from '@wordpress/api-fetch';
import { Component, Fragment } from '@wordpress/element';
import { Placeholder, Spinner, PanelBody, PanelRow, RangeControl, ToggleControl, TextControl, Button, FormTokenField } from '@wordpress/components';
import { InspectorControls } from '@wordpress/block-editor';
import { addQueryArgs } from '@wordpress/url';
import { decodeEntities } from '@wordpress/html-entities';

/**
 * Internal dependencies.
 */
import AutocompleteTokenField from '../../components/autocomplete-tokenfield';

class Edit extends Component {
	constructor( props ) {
		super( props );
		this.state = {
			isLoading: false,
			error: '',
			embed: '',
			videoToAdd: '',
		};
	}

	componentDidMount() {
		this.refreshSettings();
	}

	componentDidUpdate( prevProps ) {
		console.log( "COMPONENT DID UPDATE");
		const { attributes } = this.props;
		const { manual, videos, categories, videosToShow } = attributes;
		const { attributes: prevAttributes } = prevProps;
		const { manual: prevManual, videos: prevVideos, categories: prevCategories, videosToShow: prevVideosToShow } = prevAttributes;
		console.log( prevAttributes );
		console.log( attributes );
		if ( manual !== prevManual || videos !== prevVideos || categories !== prevCategories || videosToShow !== prevVideosToShow ) {
			this.refreshSettings();
		}
	}

	refreshSettings() {
		const { attributes, setAttributes } = this.props;
		const { manual, videos, categories, videosToShow, autoplay } = attributes;

		const basePath = '/newspack-blocks/v1/video-playlist';
		let path = '';

		if ( manual ) {
			path = addQueryArgs( basePath, {
				videos,
				manual
			} );
		} else {
			path = addQueryArgs( basePath, {
				categories,
				videosToShow
			} );
		}

		this.setState( { isLoading: true }, () => {
			apiFetch( { 
				path,
			} ).then( response => {
					const { html } = response;
					this.setState( {
						embed: html,
						isLoading: false,
					} );
				} )
				.catch( error => {
					this.setState( {
						isLoading: false,
						error: error.message,
					} );
				} );
		} );
	}

	renderPlaceholder() {
		const { isLoading, error, embed } = this.state;

		if ( isLoading ) {
			return <Placeholder icon={ <Spinner /> } className="component-placeholder__align-center" />;
		}

		if ( error.length ) {
			return (
				<Placeholder
					icon="warning"
					label={ __( 'Error', 'newspack-blocks' ) }
					instructions={ error }
				/>
			);
		}

		if ( ! embed.length ) {
			return (
				<Placeholder
					icon="warning"
					label={ __( 'Error', 'newspack-blocks' ) }
					instructions={ __( 'No videos found', 'newspack-blocks' ) }
				/>
			);
		}

		return null;
	}

	fetchCategorySuggestions = search => {
		return apiFetch( {
			path: addQueryArgs( '/wp/v2/categories', {
				search,
				per_page: 20,
				_fields: 'id,name',
				orderby: 'count',
				order: 'desc',
			} ),
		} ).then( function( categories ) {
			return categories.map( category => ( {
				value: category.id,
				label: decodeEntities( category.name ) || __( '(no title)', 'newspack-blocks' ),
			} ) );
		} );
	};
	fetchSavedCategories = categoryIDs => {
		return apiFetch( {
			path: addQueryArgs( '/wp/v2/categories', {
				per_page: 100,
				_fields: 'id,name',
				include: categoryIDs.join( ',' ),
			} ),
		} ).then( function( categories ) {
			return categories.map( category => ( {
				value: category.id,
				label: decodeEntities( category.name ) || __( '(no title)', 'newspack-blocks' ),
			} ) );
		} );
	};

	addManualVideo( tokens) {
		const { setAttributes } = this.props;
		setAttributes( { videos: tokens } );
		this.setState( { videoToAdd: '' } );
	}

	render() {
		const { attributes, setAttributes } = this.props;
		const { manual, videos, categories, videosToShow, autoplay } = attributes;
		const { embed, isLoading, videoToAdd } = this.state;

		return (
			<Fragment>
				{ ( isLoading || '' === embed ) && this.renderPlaceholder() }
				{ ! ( isLoading || '' === embed ) && (
					<div dangerouslySetInnerHTML={ { __html: embed } } />
				) }
				<InspectorControls>
					<PanelBody title={ __( 'Settings', 'newspack-blocks' ) } initialOpen={ true }>
						<PanelRow>
							<ToggleControl
								label={ __( 'Autoplay', 'newspack-blocks' ) }
								checked={ autoplay }
								onChange={ () => setAttributes( { autoplay: ! autoplay } ) }
							/>
						</PanelRow>
						<PanelRow>
							<ToggleControl
								label={ __( 'Manually select videos', 'newspack-blocks' ) }
								checked={ manual }
								onChange={ () => setAttributes( { manual: ! manual } ) }
							/>
						</PanelRow>
						{ manual && (
							<FormTokenField
								value={ videos }
								suggestions={ [ videoToAdd ] }
								onChange={ tokens => this.addManualVideo( tokens ) }
								onInputChange={ value => this.setState( { videoToAdd: value } ) }
								placeholder={ __( 'YouTube video URL', 'newspack-blocks' ) }
								label={ __( 'YouTube video URLs', 'newspack-blocks' ) }
								className='youtube-videos-manual-input'
							/>
						) }
						{ ! manual && (
							<Fragment>
									<RangeControl
										className='videosToShow'
										label={ __( 'Videos', 'newspack-blocks' ) }
										help={ __(
											"The maximum number of videos to pull from posts.",
											'newspack-blocks'
										) }
										value={ videosToShow }
										onChange={ _videosToShow => setAttributes( { videosToShow: _videosToShow } ) }
										min={ 1 }
										max={ 30 }
										required
									/>
									<AutocompleteTokenField
										key="categories"
										tokens={ categories || [] }
										onChange={ _categories => setAttributes( { categories: _categories } ) }
										fetchSuggestions={ this.fetchCategorySuggestions }
										fetchSavedInfo={ this.fetchSavedCategories }
										label={ __( 'Categories', 'newspack-blocks' ) }
									/>
							</Fragment>
						) }
					</PanelBody>
				</InspectorControls>
			</Fragment>
		);
	}
}

export default Edit;
