/* eslint-disable jsx-a11y/anchor-is-valid */

/**
 * WordPress dependencies
 */
import apiFetch from '@wordpress/api-fetch';
import { BlockControls, InspectorControls } from '@wordpress/block-editor';
import {
	BaseControl,
	Button,
	ButtonGroup,
	Notice,
	PanelBody,
	PanelRow,
	Placeholder,
	RadioControl,
	RangeControl,
	Spinner,
	ToggleControl,
	Toolbar,
	// eslint-disable-next-line @wordpress/no-unsafe-wp-apis
	__experimentalUnitControl as UnitControl,
} from '@wordpress/components';
import { Fragment, useEffect, useState } from '@wordpress/element';
import { decodeEntities } from '@wordpress/html-entities';
import {
	Icon,
	columns as columnsIcon,
	edit,
	listView,
	pullLeft,
	pullRight,
} from '@wordpress/icons';
import { __, sprintf } from '@wordpress/i18n';
import { addQueryArgs } from '@wordpress/url';
import { avatarSizeOptions, textSizeOptions, units } from '../author-profile/edit';

/**
 * External dependencies
 */
import { AutocompleteWithSuggestions } from 'newspack-components';
import classnames from 'classnames';

export default ( { attributes, setAttributes } ) => {
	const [ authors, setAuthors ] = useState( null );
	const [ error, setError ] = useState( null );
	const [ isLoading, setIsLoading ] = useState( false );
	const [ maxItemsToSuggest, setMaxItemsToSuggest ] = useState( 0 );
	const separators = [];
	const canUseCAP = Boolean( window.newspack_blocks_data?.can_use_cap );
	const {
		authorType,
		columns,
		exclude,
		layout,
		showBio,
		showSocial,
		showEmail,
		showArchiveLink,
		showAvatar,
		showSeparators,
		textSize,
		avatarAlignment,
		avatarBorderRadius,
		avatarSize,
	} = attributes;

	useEffect( () => {
		getAuthors();
	}, [ authorType, exclude ] );

	const getAuthors = async () => {
		setError( null );
		setIsLoading( true );
		try {
			const response = await apiFetch( {
				path: addQueryArgs( '/newspack-blocks/v1/author-list', {
					authorType,
					exclude: exclude.map( exclusion => parseInt( exclusion.value ) ),
					fields: 'id,name,bio,email,social,avatar,url',
				} ),
			} );

			if ( ! response ) {
				throw __( 'Error fetching authors.', 'newspack-blocks' );
			}
			setAuthors( response );
		} catch ( e ) {
			setError( e.message || e || __( 'Error fetching authors.', 'newspack-blocks' ) );
		}
		setIsLoading( false );
	};

	// Show a link to the author's post archive page, if available.
	const MaybeLink = ( { author, children } ) =>
		showArchiveLink && author && author.url ? (
			<a href="#" className="no-op">
				{ children }
			</a>
		) : (
			<>{ children }</>
		);

	return (
		<>
			<InspectorControls>
				<PanelBody title={ __( 'Author List Settings', 'newspack-blocks' ) }>
					<PanelRow>
						{ canUseCAP && (
							<RadioControl
								label={ __( 'Author Type', 'newspack' ) }
								help={ sprintf(
									// translators: help text for author type selection.
									__( 'Show %s.', 'newspack-blocks' ),
									'all' === authorType
										? __( 'both guest authors and WP users', 'newspack-blocks' )
										: // translators: currently selected author type option.
										  sprintf(
												__( '%s only', 'newspack-blocks' ),
												'guest-authors' === authorType
													? __( 'guest authors', 'newspack-blocks' )
													: __( 'WP users', 'newspack-blocks' )
										  )
								) }
								selected={ authorType || 'all' }
								options={ [
									{ label: __( 'All authors', 'newspack-blocks' ), value: 'all' },
									{ label: __( 'Guest authors', 'newspack-blocks' ), value: 'guest-authors' },
									{ label: __( 'WP users', 'newspack-blocks' ), value: 'users' },
								] }
								onChange={ value => setAttributes( { authorType: value } ) }
							/>
						) }
					</PanelRow>
					<PanelRow>
						{ 'columns' === layout && (
							<RangeControl
								label={ __( 'Columns', 'newspack-blocks' ) }
								value={ columns }
								onChange={ _columns => setAttributes( { columns: _columns } ) }
								min={ 2 }
								max={ 6 }
								required
							/>
						) }
					</PanelRow>
					<PanelRow>
						<ToggleControl
							label={ __( 'Display separators', 'newspack-blocks' ) }
							help={ __( 'Chunk authors alphabetically.', 'newspack-blocks' ) }
							checked={ showSeparators }
							onChange={ () => setAttributes( { showSeparators: ! showSeparators } ) }
						/>
					</PanelRow>
				</PanelBody>
				<PanelBody title={ __( 'Author List Exclusions', 'newspack-block' ) }>
					<p>{ __( 'Authors selected here will not be shown.', 'newspack-blocks' ) }</p>
					<PanelRow>
						<AutocompleteWithSuggestions
							label={ __( 'Search by author name', 'newspack-blocks' ) }
							fetchSuggestions={ async ( search = null, offset = 0 ) => {
								const response = await apiFetch( {
									parse: false,
									path: addQueryArgs( '/newspack-blocks/v1/authors', {
										search,
										offset,
										fields: 'id,name',
									} ),
								} );

								const total = parseInt( response.headers.get( 'x-wp-total' ) || 0 );
								const suggestions = await response.json();

								// Set max items for "load more" functionality in suggestions list.
								if ( ! maxItemsToSuggest && ! search ) {
									setMaxItemsToSuggest( total );
								}

								return suggestions.map( _author => ( {
									value: _author.id,
									label: decodeEntities( _author.name ) || __( '(no name)', 'newspack' ),
								} ) );
							} }
							maxItemsToSuggest={ maxItemsToSuggest }
							multiSelect={ true }
							onChange={ items => setAttributes( { exclude: items } ) }
							postTypeLabel={ __( 'author', 'newspack-blocks' ) }
							postTypeLabelPlural={ __( 'authors', 'newspack-blocks' ) }
							selectedItems={ exclude }
						/>
					</PanelRow>
				</PanelBody>
				<PanelBody title={ __( 'Author Profile Settings', 'newspack-blocks' ) }>
					<BaseControl
						label={ __( 'Text Size', 'newspack-blocks' ) }
						id="newspack-blocks__text-size-control"
					>
						<PanelRow>
							<ButtonGroup
								id="newspack-blocks__text-size-control-buttons"
								aria-label={ __( 'Text Size', 'newspack-blocks' ) }
							>
								{ textSizeOptions.map( option => {
									const isCurrent = textSize === option.value;
									return (
										<Button
											isLarge
											isPrimary={ isCurrent }
											aria-pressed={ isCurrent }
											aria-label={ option.label }
											key={ option.value }
											onClick={ () => setAttributes( { textSize: option.value } ) }
										>
											{ option.shortName }
										</Button>
									);
								} ) }
							</ButtonGroup>
						</PanelRow>
					</BaseControl>
					<PanelRow>
						<ToggleControl
							label={ __( 'Display biographical info', 'newspack-blocks' ) }
							checked={ showBio }
							onChange={ () => setAttributes( { showBio: ! showBio } ) }
						/>
					</PanelRow>
					<PanelRow>
						<ToggleControl
							label={ __( 'Display social links', 'newspack-blocks' ) }
							checked={ showSocial }
							onChange={ () => setAttributes( { showSocial: ! showSocial } ) }
						/>
					</PanelRow>
					<PanelRow>
						<ToggleControl
							label={ __( 'Display email address', 'newspack-blocks' ) }
							checked={ showEmail }
							onChange={ () => setAttributes( { showEmail: ! showEmail } ) }
						/>
					</PanelRow>
					<PanelRow>
						<ToggleControl
							label={ __( 'Link to author archive', 'newspack-blocks' ) }
							checked={ showArchiveLink }
							onChange={ () => setAttributes( { showArchiveLink: ! showArchiveLink } ) }
						/>
					</PanelRow>
				</PanelBody>
				<PanelBody title={ __( 'Avatar Settings', 'newspack-blocks' ) }>
					<PanelRow>
						<ToggleControl
							label={ __( 'Display avatar', 'newspack-blocks' ) }
							checked={ showAvatar }
							onChange={ () => setAttributes( { showAvatar: ! showAvatar } ) }
						/>
					</PanelRow>
					{ showAvatar && (
						<BaseControl
							label={ __( 'Avatar Size', 'newspack-blocks' ) }
							id="newspack-blocks__avatar-size-control"
						>
							<PanelRow>
								<ButtonGroup
									id="newspack-blocks__avatar-size-control-buttons"
									aria-label={ __( 'Avatar Size', 'newspack-blocks' ) }
								>
									{ avatarSizeOptions.map( option => {
										const isCurrent = avatarSize === option.value;
										return (
											<Button
												isLarge
												isPrimary={ isCurrent }
												aria-pressed={ isCurrent }
												aria-label={ option.label }
												key={ option.value }
												onClick={ () => setAttributes( { avatarSize: option.value } ) }
											>
												{ option.shortName }
											</Button>
										);
									} ) }
								</ButtonGroup>
							</PanelRow>
						</BaseControl>
					) }
					{ showAvatar && (
						<PanelRow>
							<UnitControl
								label={ __( 'Avatar border radius', 'newspack-blocks' ) }
								labelPosition="edge"
								__unstableInputWidth="80px"
								units={ units }
								value={ avatarBorderRadius }
								onChange={ value =>
									setAttributes( { avatarBorderRadius: 0 > parseFloat( value ) ? '0' : value } )
								}
							/>
						</PanelRow>
					) }
				</PanelBody>
			</InspectorControls>
			{ authors && ! isLoading && (
				<BlockControls>
					<Toolbar
						controls={ [
							{
								icon: <Icon icon={ listView } />,
								title: __( 'List', 'newspack-blocks' ),
								isActive: 'list' === layout,
								onClick: () => {
									setAttributes( { layout: 'list' } );
								},
							},
							{
								icon: <Icon icon={ columnsIcon } />,
								title: __( 'Columns', 'newspack-blocks' ),
								isActive: 'columns' === layout,
								onClick: () => {
									setAttributes( { layout: 'columns' } );
								},
							},
						] }
					/>
					{ showAvatar && 'is-style-center' !== attributes.className && (
						<Toolbar
							controls={ [
								{
									icon: <Icon icon={ pullLeft } />,
									title: __( 'Show avatar on left', 'newspack-blocks' ),
									isActive: avatarAlignment === 'left',
									onClick: () => setAttributes( { avatarAlignment: 'left' } ),
								},
								{
									icon: <Icon icon={ pullRight } />,
									title: __( 'Show avatar on right', 'newspack-blocks' ),
									isActive: avatarAlignment === 'right',
									onClick: () => setAttributes( { avatarAlignment: 'right' } ),
								},
							] }
						/>
					) }
					<Toolbar
						controls={ [
							{
								icon: <Icon icon={ edit } />,
								title: __( 'Edit selection', 'newspack-blocks' ),
								onClick: () => {
									setAttributes( { authorId: 0 } );
									setAuthor( null );
								},
							},
						] }
					/>
				</BlockControls>
			) }
			<div
				className={ classnames( attributes.className, {
					'wp-block-newspack-blocks-author-list': true,
					'is-columns': ! isLoading && 'columns' === layout,
					[ `columns-${ columns }` ]: ! isLoading && 'columns' === layout,
				} ) }
			>
				{ ! isLoading &&
					! error &&
					authors &&
					Array.isArray( authors ) &&
					authors.map( ( author, index ) => {
						// Combine social links and email, which are shown together.
						const socialLinks = ( showSocial && author && author.social ) || {};
						if ( showEmail && author && author.email ) {
							socialLinks.email = author.email;
						} else {
							delete socialLinks.email;
						}

						const { last_name: lastName } = author;
						const firstLetter = lastName.charAt( 0 ).toUpperCase();
						const showSeparator = showSeparators && 0 > separators.indexOf( firstLetter );

						if ( showSeparator ) {
							separators.push( firstLetter );
						}

						return (
							<Fragment key={ index }>
								{ showSeparator && (
									<h2 className="newspack-blocks__author-list-separator">{ firstLetter }</h2>
								) }
								<div
									className={ classnames(
										'wp-block-newspack-blocks-author-profile',
										'avatar-' + avatarAlignment,
										'text-size-' + textSize,
										{ 'is-style-center': 'is-style-center' === attributes.className }
									) }
								>
									{ showAvatar && author.avatar && (
										<div className="wp-block-newspack-blocks-author-profile__avatar">
											<figure
												style={ {
													borderRadius: avatarBorderRadius,
													height: `${ avatarSize }px`,
													width: `${ avatarSize }px`,
												} }
												dangerouslySetInnerHTML={ { __html: author.avatar } }
											/>
										</div>
									) }
									<div className="wp-block-newspack-blocks-author-profile__bio">
										<h3>
											<MaybeLink author={ author }>{ author.name }</MaybeLink>
										</h3>
										{ showBio && author.bio && (
											<p>
												{ author.bio }{ ' ' }
												{ showArchiveLink && (
													<a href="#" className="no-op">
														{ __( 'More by', 'newspack-blocks' ) + ' ' + author.name }
													</a>
												) }
											</p>
										) }
										{ ( showEmail || showSocial ) && (
											<ul className="wp-block-newspack-blocks-author-profile__social-links">
												{ Object.keys( socialLinks ).map( service => (
													<li key={ service }>
														<a href="#" className="no-op">
															{ socialLinks[ service ].svg && (
																<span
																	dangerouslySetInnerHTML={ { __html: socialLinks[ service ].svg } }
																/>
															) }
															<span className={ socialLinks[ service ].svg ? 'hidden' : 'visible' }>
																{ service }
															</span>
														</a>
													</li>
												) ) }
											</ul>
										) }
									</div>
								</div>
							</Fragment>
						);
					} ) }
				{ ( ! authors || isLoading ) && (
					<Placeholder
						icon={ <Icon icon={ listView } /> }
						label={ __( 'Author List', 'newspack-blocks' ) }
					>
						{ error && (
							<Notice status="error" isDismissible={ false }>
								{ error }
							</Notice>
						) }
						{ isLoading && (
							<div className="is-loading">
								{ __( 'Fetching authors…', 'newspack-blocks' ) }
								<Spinner />
							</div>
						) }
					</Placeholder>
				) }
			</div>
		</>
	);
};
