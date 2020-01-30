/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import apiFetch from '@wordpress/api-fetch';
import { Component, Fragment } from '@wordpress/element';
import { Placeholder, Spinner, PanelBody, PanelRow, RangeControl, ToggleControl, TextControl, Button } from '@wordpress/components';
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
		this.getSettings();
	}

	getSettings() {
		const path = '/newspack-blocks/v1/video-playlist';

		this.setState( { isLoading: true }, () => {
			apiFetch( { path } )
				.then( response => {
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

	addManualVideo() {
		const { attributes, setAttributes } = this.props;
		const { videos } = attributes;
		const { videoToAdd } = this.state;

		videos.push( videoToAdd );
		setAttributes( { videos } );
		console.log( videos );
		this.setState( { videoToAdd: '' } );
	}

	render() {
		const { attributes, setAttributes } = this.props;
		const { manual, videos, categories, videosToShow } = attributes;
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
								label={ __( 'Manually select videos', 'newspack-blocks' ) }
								checked={ manual }
								onChange={ () => setAttributes( { manual: ! manual } ) }
							/>
						</PanelRow>
						{ manual && (
							<Fragment>
								{ videos.map( function( video, index ) {
									<div>
										{ video }
										<span>X</span>
									</div>
								} ) }
								<TextControl
									label={ __( 'Add video', 'newspack-blocks' ) }
									value={ videoToAdd }
    								onChange={ ( _videoToAdd ) => this.setState( { videoToAdd: _videoToAdd } ) }
    							/>
								<Button 
									isSecondary
									onClick={ () => this.addManualVideo() }
									>
    								{ __( 'Add', 'newspack-blocks' ) }
								</Button>
							</Fragment>
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
