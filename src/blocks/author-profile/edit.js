/**
 * WordPress dependencies
 */
import apiFetch from '@wordpress/api-fetch';
import { BlockControls, InnerBlocks, InspectorControls, useBlockProps } from '@wordpress/block-editor';
import { registerBlockBindingsSource } from '@wordpress/blocks';
import {
	Button,
	ButtonGroup,
	Notice,
	PanelBody,
	Placeholder,
	SelectControl,
	Spinner,
	ToggleControl,
	Toolbar,
	// eslint-disable-next-line @wordpress/no-unsafe-wp-apis
	__experimentalUnitControl as UnitControl,
	// eslint-disable-next-line @wordpress/no-unsafe-wp-apis
	__experimentalToggleGroupControl as ToggleGroupControl,
	// eslint-disable-next-line @wordpress/no-unsafe-wp-apis
	__experimentalToggleGroupControlOption as ToggleGroupControlOption,
} from '@wordpress/components';
import { useEffect, useState, useMemo } from '@wordpress/element';
import { useSelect } from '@wordpress/data';
import { decodeEntities } from '@wordpress/html-entities';
import { pencil, postAuthor, pullLeft, pullRight } from '@wordpress/icons';
import { __, sprintf } from '@wordpress/i18n';
import { addQueryArgs } from '@wordpress/url';

/**
 * Register block bindings source for author data in the editor.
 * This enables core blocks to display author data via bindings.
 *
 * Note: The binding reads from a global author object that is set by the
 * AuthorContext.Provider. This is a workaround since bindings don't have
 * direct access to React context.
 */
if ( typeof registerBlockBindingsSource === 'function' ) {
	registerBlockBindingsSource( {
		name: 'newspack-blocks/author',
		label: __( 'Author Profile', 'newspack-blocks' ),
		getValues( { bindings } ) {
			// Read author from global state set by AuthorContext.Provider.
			const author = window.__newspackCurrentAuthor || {};
			return Object.fromEntries(
				Object.entries( bindings ).map( ( [ attribute, { args } ] ) => {
					const key = args?.key;
					if ( ! key ) {
						return [ attribute, '' ];
					}
					// Handle special cases.
					if ( key === 'url' || key === 'archive_url' ) {
						return [ attribute, author.url || '' ];
					}
					// "More by [author]" link text.
					if ( key === 'archive_link_text' ) {
						return [ attribute, author.name ? `${ __( 'More by', 'newspack-blocks' ) } ${ author.name }` : '' ];
					}
					return [ attribute, author[ key ] || '' ];
				} )
			);
		},
	} );
}

/**
 * Internal dependencies
 */
import { SingleAuthor } from './single-author';
import { AuthorDisplaySettings } from '../shared/author';
import { AuthorContext } from './context';

/**
 * External dependencies
 */
import { AutocompleteWithSuggestions } from 'newspack-components';

// Available units for avatarBorderRadius option.
export const units = [
	{
		value: '%',
		label: '%',
	},
	{
		value: 'px',
		label: 'px',
	},
	{
		value: 'em',
		label: 'em',
	},
	{
		value: 'rem',
		label: 'rem',
	},
];

// Textsize options.
export const textSizeOptions = [
	{
		value: 'small',
		label: /* translators: label for small text size option */ __( 'Small', 'newspack-blocks' ),
		shortName: /* translators: abbreviation for small text size option */ __( 'S', 'newspack-blocks' ),
	},
	{
		value: 'medium',
		label: /* translators: label for medium text size option */ __( 'Medium', 'newspack-blocks' ),
		shortName: /* translators: abbreviation for medium text size option */ __( 'M', 'newspack-blocks' ),
	},
	{
		value: 'large',
		label: /* translators: label for small text size option */ __( 'Large', 'newspack-blocks' ),
		shortName: /* translators: abbreviation for large text size option */ __( 'L', 'newspack-blocks' ),
	},
	{
		value: 'extra-large',
		label: /* translators: label for extra-large text size option */ __( 'Extra Large', 'newspack-blocks' ),
		shortName: /* translators: abbreviation for small text size option */ __( 'XL', 'newspack-blocks' ),
	},
];

// Avatar size options.
export const avatarSizeOptions = [
	{
		value: 72,
		label: /* translators: label for small avatar size option */ __( 'Small', 'newspack-blocks' ),
		shortName: /* translators: abbreviation for small avatar size option */ __( 'S', 'newspack-blocks' ),
	},
	{
		value: 128,
		label: /* translators: label for medium avatar size option */ __( 'Medium', 'newspack-blocks' ),
		shortName: /* translators: abbreviation for medium avatar size option */ __( 'M', 'newspack-blocks' ),
	},
	{
		value: 192,
		label: /* translators: label for large avatar size option */ __( 'Large', 'newspack-blocks' ),
		shortName: /* translators: abbreviation for large avatar size option */ __( 'L', 'newspack-blocks' ),
	},
	{
		value: 256,
		label: /* translators: label for extra-large avatar size option */ __( 'Extra-large', 'newspack-blocks' ),
		shortName: /* translators: abbreviation for extra-large avatar size option  */ __( 'XL', 'newspack-blocks' ),
	},
];

// Feature flag for nested inner blocks mode.
const isNestedMode = window.newspack_blocks_data?.authorProfileNestedBlocks ?? false;

// Helper to create a bound paragraph block with custom list view name.
const createBoundParagraph = ( key, className, name ) => [
	'core/paragraph',
	{
		metadata: {
			name, // Custom name shown in list view.
			bindings: {
				content: {
					source: 'newspack-blocks/author',
					args: { key },
				},
			},
		},
		className,
	},
];

// Template for nested inner blocks.
// Each author field is a separate block that can be reordered or removed.
// Block bindings connect core block attributes to author data via 'newspack-blocks/author' source.
const NESTED_TEMPLATE = [
	[
		'core/columns',
		{ isStackedOnMobile: true },
		[
			[ 'core/column', { width: '20%' }, [ [ 'newspack/avatar', { size: 128 } ] ] ],
			[
				'core/column',
				{ width: '80%' },
				[
					[
						'core/heading',
						{
							level: 3,
							metadata: {
								name: __( 'Author Name', 'newspack-blocks' ),
								bindings: {
									content: {
										source: 'newspack-blocks/author',
										args: { key: 'name' },
									},
								},
							},
							className: 'author-name',
						},
					],
					createBoundParagraph( 'newspack_job_title', 'author-job-title', __( 'Job Title', 'newspack-blocks' ) ),
					createBoundParagraph( 'newspack_role', 'author-role', __( 'Role', 'newspack-blocks' ) ),
					createBoundParagraph( 'newspack_employer', 'author-employer', __( 'Employer', 'newspack-blocks' ) ),
					createBoundParagraph( 'bio', 'author-bio', __( 'Bio', 'newspack-blocks' ) ),
					createBoundParagraph( 'archive_link_text', 'author-archive-link', __( 'More by Author', 'newspack-blocks' ) ),
					[ 'newspack-blocks/author-profile-social' ],
				],
			],
		],
	],
];

// Placeholder author for Site Editor template context.
// When editing a template, we show generic labels instead of real author data.
const getPlaceholderAuthor = () => ( {
	id: 'placeholder',
	name: __( '[Author Name]', 'newspack-blocks' ),
	bio: __( '[Author bio will appear here]', 'newspack-blocks' ),
	newspack_job_title: __( '[Job Title]', 'newspack-blocks' ),
	newspack_role: __( '[Role]', 'newspack-blocks' ),
	newspack_employer: __( '[Employer]', 'newspack-blocks' ),
	url: '#',
	avatar: '', // Empty triggers the avatar block's built-in placeholder rendering.
	social: {
		facebook: { url: '#' },
		twitter: { url: '#' },
		linkedin: { url: '#' },
	},
	email: { url: 'mailto:placeholder@example.com' },
	newspack_phone_number: { url: 'tel:0000000000' },
} );

// Allowed inner blocks for nested mode.
// Includes core blocks for flexibility and custom blocks for complex functionality.
const ALLOWED_BLOCKS = [
	'newspack/avatar',
	'core/heading',
	'core/paragraph',
	'core/button',
	'core/buttons',
	'core/group',
	'core/columns',
	'core/column',
	'core/social-links',
	'core/social-link',
	'newspack-blocks/author-profile-social', // Keep for social icons with SVGs.
	'newspack-blocks/author-social-link', // Individual social icon blocks.
];

const AuthorProfile = ( { attributes, setAttributes, context } ) => {
	const blockProps = useBlockProps();

	// ALL HOOKS MUST BE CALLED UNCONDITIONALLY (React rules of hooks)
	const [ author, setAuthor ] = useState( null );
	const [ contextualAuthors, setContextualAuthors ] = useState( [] );
	const [ suggestions, setSuggestions ] = useState( null );
	const [ error, setError ] = useState( null );
	const [ isLoading, setIsLoading ] = useState( false );
	const [ maxItemsToSuggest, setMaxItemsToSuggest ] = useState( 0 );
	const [ showSpecificSelector, setShowSpecificSelector ] = useState( false );
	const [ previewAuthorIndex, setPreviewAuthorIndex ] = useState( 0 );

	const {
		authorId,
		isGuestAuthor,
		isContextual,
		layoutVersion,
		showSocial,
		showEmail,
		textSize,
		showAvatar,
		avatarAlignment,
		avatarBorderRadius,
		avatarSize,
		avatarHideDefault,
	} = attributes;

	// Get post ID from block context or editor
	const editorPostId = useSelect( select => select( 'core/editor' )?.getCurrentPostId?.(), [] );
	const postId = context?.postId || editorPostId;

	// Check if custom byline is active on the current post
	const customBylineActive = useSelect(
		select => {
			if ( ! isContextual ) {
				return false;
			}
			const meta = select( 'core/editor' )?.getEditedPostAttribute?.( 'meta' );
			return meta?._newspack_byline_active ?? false;
		},
		[ isContextual ]
	);

	// Detect Site Editor template context where real author data is not meaningful.
	const isTemplateLikeContext = useSelect( select => {
		const postType = select( 'core/editor' )?.getCurrentPostType?.();
		return postType === 'wp_template' || postType === 'wp_template_part';
	}, [] );

	// Set layoutVersion to 2 when in nested mode for migration detection
	useEffect( () => {
		if ( isNestedMode && layoutVersion !== 2 ) {
			setAttributes( { layoutVersion: 2 } );
		}
	}, [ isNestedMode, layoutVersion, setAttributes ] );

	// Fetch author for specific mode
	useEffect( () => {
		if ( isContextual || 0 === authorId ) {
			return;
		}
		getAuthorById();
	}, [ authorId, avatarHideDefault, isGuestAuthor, isContextual ] );

	// Fetch authors for contextual mode
	useEffect( () => {
		if ( ! isContextual || customBylineActive || ! postId || isTemplateLikeContext ) {
			setContextualAuthors( [] );
			return;
		}
		getContextualAuthors();
	}, [ isContextual, postId, avatarHideDefault, showEmail, customBylineActive, isTemplateLikeContext ] );

	const getAuthorById = async () => {
		setError( null );
		setIsLoading( true );
		try {
			const params = {
				author_id: authorId,
				is_guest_author: isGuestAuthor ? 1 : 0,
				fields: 'id,name,bio,email,social,avatar,url',
			};

			if ( avatarHideDefault ) {
				params.avatar_hide_default = 1;
			}

			const response = await apiFetch( {
				path: addQueryArgs( '/newspack-blocks/v1/authors', params ),
			} );

			const _author = response.pop();

			if ( ! _author ) {
				throw sprintf(
					/* translators: %s: error text for when no authors are found. */
					__( 'No authors or guest authors found for ID %s.', 'newspack-blocks' ),
					authorId
				);
			}
			setAuthor( _author );
		} catch ( e ) {
			setError(
				e.message ||
					e ||
					sprintf(
						/* translators: %s: error text for when no authors are found. */
						__( 'No authors or guest authors found for ID %s.', 'newspack-blocks' ),
						authorId
					)
			);
		}
		setIsLoading( false );
	};

	const getContextualAuthors = async () => {
		setError( null );
		setIsLoading( true );
		try {
			// Only fetch email if showEmail is enabled (privacy consideration)
			const fields = [ 'id', 'name', 'bio', 'social', 'avatar', 'url' ];
			if ( showEmail ) {
				fields.push( 'email' );
			}

			const params = {
				post_id: postId,
				fields: fields.join( ',' ),
			};

			if ( avatarHideDefault ) {
				params.avatar_hide_default = 1;
			}

			const response = await apiFetch( {
				path: addQueryArgs( '/newspack-blocks/v1/authors', params ),
			} );

			setContextualAuthors( response || [] );
		} catch ( e ) {
			setError( e.message || e || __( 'Error fetching authors for this post.', 'newspack-blocks' ) );
			setContextualAuthors( [] );
		}
		setIsLoading( false );
	};

	// Memoize authors for rendering based on mode
	const authorsToRender = useMemo( () => {
		if ( isContextual ) {
			if ( isTemplateLikeContext ) {
				return [ getPlaceholderAuthor() ];
			}
			return contextualAuthors;
		}
		return author ? [ author ] : [];
	}, [ isContextual, isTemplateLikeContext, contextualAuthors, author ] );

	// Reset preview index when authors list changes (e.g., switching posts)
	useEffect( () => {
		setPreviewAuthorIndex( 0 );
	}, [ authorsToRender.length ] );

	// Set global author for block bindings in editor.
	// This allows bound core blocks to access author data.
	useEffect( () => {
		const safeIndex = Math.min( previewAuthorIndex, Math.max( 0, authorsToRender.length - 1 ) );
		const previewAuthor = authorsToRender[ safeIndex ] || null;
		window.__newspackCurrentAuthor = previewAuthor;
		return () => {
			window.__newspackCurrentAuthor = null;
		};
	}, [ authorsToRender, previewAuthorIndex ] );

	// Combine social links and email, which are shown together.
	const getSocialLinks = authorData => {
		const socialLinks = ( showSocial && authorData?.social ) || {};
		if ( showEmail && authorData?.email ) {
			socialLinks.email = authorData.email;
		} else {
			delete socialLinks.email;
		}
		return socialLinks;
	};

	// Determine if we're in nested layout mode (publisher-controlled composition).
	// In nested mode, hide field toggles since publishers control display by adding/removing blocks.
	const isNestedLayout = layoutVersion === 2;

	// Inspector controls for display settings
	const inspectorControls = (
		<InspectorControls>
			<PanelBody title={ __( 'Author Source', 'newspack-blocks' ) } initialOpen={ true }>
				<ToggleControl
					label={ __( 'Use contextual author', 'newspack-blocks' ) }
					help={
						isContextual
							? __( 'Displays authors from current post or archive.', 'newspack-blocks' )
							: __( 'Displays a specific selected author.', 'newspack-blocks' )
					}
					checked={ isContextual }
					onChange={ () => {
						setAttributes( {
							isContextual: ! isContextual,
							authorId: 0, // Reset author selection when switching modes
						} );
						setAuthor( null );
						setShowSpecificSelector( false );
					} }
				/>
			</PanelBody>
			{ /* In nested mode, publishers control layout via inner blocks - no need for field toggles */ }
			{ ! isNestedLayout && (
				<PanelBody title={ __( 'Author Profile Settings', 'newspack-blocks' ) }>
					<ToggleGroupControl
						label={ __( 'Text Size', 'newspack-blocks' ) }
						value={ textSize }
						onChange={ value => setAttributes( { textSize: value } ) }
						isBlock
						__next40pxDefaultSize
					>
						{ textSizeOptions.map( option => (
							<ToggleGroupControlOption key={ option.value } label={ option.shortName } value={ option.value } />
						) ) }
					</ToggleGroupControl>
					<AuthorDisplaySettings attributes={ attributes } setAttributes={ setAttributes } />
				</PanelBody>
			) }
			{ /* In nested mode, avatar is controlled via the inner newspack/avatar block */ }
			{ ! isNestedLayout && (
				<PanelBody title={ __( 'Avatar', 'newspack-blocks' ) }>
					<ToggleControl
						label={ __( 'Display avatar', 'newspack-blocks' ) }
						checked={ showAvatar }
						onChange={ () => setAttributes( { showAvatar: ! showAvatar } ) }
					/>
					{ showAvatar && (
						<ToggleControl
							label={ __( 'Hide default avatar', 'newspack-blocks' ) }
							checked={ avatarHideDefault }
							onChange={ () => setAttributes( { avatarHideDefault: ! avatarHideDefault } ) }
						/>
					) }
					{ showAvatar && (
						<ToggleGroupControl
							label={ __( 'Size', 'newspack-blocks' ) }
							aria-label={ __( 'Avatar size', 'newspack-blocks' ) }
							value={ avatarSize }
							onChange={ value => setAttributes( { avatarSize: value } ) }
							isBlock
							__next40pxDefaultSize
						>
							{ avatarSizeOptions.map( option => (
								<ToggleGroupControlOption key={ option.value } label={ option.shortName } value={ option.value } />
							) ) }
						</ToggleGroupControl>
					) }
					{ showAvatar && (
						<UnitControl
							label={ __( 'Border radius', 'newspack-blocks' ) }
							aria-label={ __( 'Avatar border radius', 'newspack-blocks' ) }
							labelPosition="edge"
							__next40pxDefaultSize
							__unstableInputWidth="80px"
							units={ units }
							value={ avatarBorderRadius }
							onChange={ value => setAttributes( { avatarBorderRadius: 0 > parseFloat( value ) ? '0' : value } ) }
						/>
					) }
				</PanelBody>
			) }
		</InspectorControls>
	);

	// Block controls for avatar alignment and edit button
	const blockControls = authorsToRender.length > 0 && (
		<BlockControls>
			{ ! isNestedLayout && showAvatar && ! attributes.className?.includes( 'is-style-center' ) && (
				<Toolbar
					controls={ [
						{
							icon: pullLeft,
							title: __( 'Show avatar on left', 'newspack-blocks' ),
							isActive: avatarAlignment === 'left',
							onClick: () => setAttributes( { avatarAlignment: 'left' } ),
						},
						{
							icon: pullRight,
							title: __( 'Show avatar on right', 'newspack-blocks' ),
							isActive: avatarAlignment === 'right',
							onClick: () => setAttributes( { avatarAlignment: 'right' } ),
						},
					] }
				/>
			) }
			{ ! isContextual && (
				<Toolbar
					controls={ [
						{
							icon: pencil,
							title: __( 'Edit selection', 'newspack-blocks' ),
							onClick: () => {
								setAttributes( { authorId: 0 } );
								setAuthor( null );
							},
						},
					] }
				/>
			) }
		</BlockControls>
	);

	// NESTED MODE: When feature flag is enabled, use InnerBlocks
	if ( isNestedMode ) {
		// Mode selection for new blocks in nested mode
		if ( ! authorId && ! isContextual && ! showSpecificSelector ) {
			return (
				<div { ...blockProps }>
					{ inspectorControls }
					<Placeholder className="newspack-blocks-author-profile" icon={ postAuthor } label={ __( 'Author Profile', 'newspack-blocks' ) }>
						<p>{ __( 'Select a type to start with.', 'newspack-blocks' ) }</p>
						<ButtonGroup>
							<Button variant="secondary" onClick={ () => setShowSpecificSelector( true ) }>
								{ __( 'Specific', 'newspack-blocks' ) }
							</Button>
							<Button variant="primary" onClick={ () => setAttributes( { isContextual: true } ) }>
								{ __( 'Contextual', 'newspack-blocks' ) }
							</Button>
						</ButtonGroup>
					</Placeholder>
				</div>
			);
		}

		// Loading state
		if ( isLoading ) {
			return (
				<div { ...blockProps }>
					{ inspectorControls }
					<div className="newspack-author-profile-loading">
						<Spinner />
						{ __( 'Loading author info…', 'newspack-blocks' ) }
					</div>
				</div>
			);
		}

		// Custom byline active warning (contextual mode only)
		if ( isContextual && customBylineActive ) {
			return (
				<div { ...blockProps }>
					{ inspectorControls }
					<div className="newspack-author-profile-disabled">
						<Notice status="warning" isDismissible={ false }>
							{ __( 'Author bio is hidden because Custom Byline is active on this post.', 'newspack-blocks' ) }
						</Notice>
					</div>
				</div>
			);
		}

		// Specific mode: show author search when no author selected
		if ( ! isContextual && ! authorId ) {
			return (
				<div { ...blockProps }>
					{ inspectorControls }
					<Placeholder className="newspack-blocks-author-profile" icon={ postAuthor } label={ __( 'Author Profile', 'newspack-blocks' ) }>
						{ error && (
							<Notice status="error" isDismissible={ false }>
								{ error }
							</Notice>
						) }
						<AutocompleteWithSuggestions
							label={ __( 'Search for an author to display', 'newspack-blocks' ) }
							help={ __( 'Begin typing name, click autocomplete result to select.', 'newspack-blocks' ) }
							fetchSuggestions={ async ( search = null, offset = 0 ) => {
								setSuggestions( null );
								if ( authorId && ! error ) {
									return [];
								}
								const response = await apiFetch( {
									parse: false,
									path: addQueryArgs( '/newspack-blocks/v1/authors', {
										search,
										offset,
										fields: 'id,name',
									} ),
								} );
								const total = parseInt( response.headers.get( 'x-wp-total' ) || 0, 10 );
								const authors = await response.json();
								if ( ! maxItemsToSuggest && ! search ) {
									setMaxItemsToSuggest( total );
								}
								const _suggestions = authors.map( _author => ( {
									value: _author.id,
									label: decodeEntities( _author.name ) || __( '(no name)', 'newspack-blocks' ),
									isGuestAuthor: _author.is_guest,
								} ) );
								setSuggestions( _suggestions );
								return _suggestions;
							} }
							maxItemsToSuggest={ maxItemsToSuggest }
							onChange={ items => {
								let selectionIsGuest = false;
								const selection = items[ 0 ];
								if ( suggestions ) {
									suggestions.forEach( suggestion => {
										if ( parseInt( selection?.value, 10 ) === parseInt( suggestion?.value, 10 ) && suggestion?.isGuestAuthor ) {
											selectionIsGuest = true;
										}
									} );
								}
								setAttributes( {
									authorId: parseInt( selection?.value || 0, 10 ),
									isGuestAuthor: selectionIsGuest,
								} );
							} }
							postTypeLabel={ __( 'author', 'newspack-blocks' ) }
							postTypeLabelPlural={ __( 'authors', 'newspack-blocks' ) }
							selectedItems={ [] }
						/>
					</Placeholder>
				</div>
			);
		}

		// Contextual mode: no authors found
		if ( isContextual && ! authorsToRender.length ) {
			return (
				<div { ...blockProps }>
					{ inspectorControls }
					<Placeholder className="newspack-blocks-author-profile" icon={ postAuthor } label={ __( 'Author Profile', 'newspack-blocks' ) }>
						{ __( 'No authors found for this post.', 'newspack-blocks' ) }
					</Placeholder>
				</div>
			);
		}

		// Get preview author (bounds-checked)
		const safeIndex = Math.min( previewAuthorIndex, authorsToRender.length - 1 );
		const previewAuthor = authorsToRender[ safeIndex ];

		// Set global synchronously so bindings have access on first render.
		// The useEffect handles cleanup when component unmounts.
		window.__newspackCurrentAuthor = previewAuthor;

		const nestedBlockProps = {
			...blockProps,
			className: `${ blockProps.className } wp-block-newspack-blocks-author-profile is-nested-mode`,
		};

		return (
			<AuthorContext.Provider value={ previewAuthor }>
				<div { ...nestedBlockProps }>
					{ inspectorControls }
					{ blockControls }
					{ /* Author selector: only shown in contextual mode with multiple authors */ }
					{ isContextual && authorsToRender.length > 1 && (
						<div className="newspack-author-profile-preview-selector">
							<SelectControl
								label={ __( 'Preview author', 'newspack-blocks' ) }
								value={ safeIndex }
								options={ authorsToRender.map( ( a, index ) => ( {
									label: a.name,
									value: index,
								} ) ) }
								onChange={ value => setPreviewAuthorIndex( parseInt( value, 10 ) ) }
							/>
							<p className="description">
								{ sprintf(
									/* translators: %d: number of authors */
									__( 'Previewing 1 of %d authors. All authors display on frontend.', 'newspack-blocks' ),
									authorsToRender.length
								) }
							</p>
						</div>
					) }
					{ /* Key forces re-render when author changes, which re-evaluates bindings */ }
					<InnerBlocks key={ `author-${ previewAuthor?.id || 'none' }` } template={ NESTED_TEMPLATE } allowedBlocks={ ALLOWED_BLOCKS } />
				</div>
			</AuthorContext.Provider>
		);
	}

	// MODE SELECTION: Show mode selector for NEW blocks (no authorId and not contextual)
	if ( ! authorId && ! isContextual && ! showSpecificSelector ) {
		return (
			<div { ...blockProps }>
				{ inspectorControls }
				<Placeholder className="newspack-blocks-author-profile" icon={ postAuthor } label={ __( 'Author Profile', 'newspack-blocks' ) }>
					<p>{ __( 'Select a type to start with.', 'newspack-blocks' ) }</p>
					<ButtonGroup>
						<Button variant="secondary" onClick={ () => setShowSpecificSelector( true ) }>
							{ __( 'Specific', 'newspack-blocks' ) }
						</Button>
						<Button variant="primary" onClick={ () => setAttributes( { isContextual: true } ) }>
							{ __( 'Contextual', 'newspack-blocks' ) }
						</Button>
					</ButtonGroup>
				</Placeholder>
			</div>
		);
	}

	// CONTEXTUAL MODE
	if ( isContextual ) {
		// Loading state
		if ( isLoading ) {
			return (
				<div { ...blockProps }>
					{ inspectorControls }
					<div className="newspack-author-profile-loading">
						<Spinner />
						{ __( 'Loading author info…', 'newspack-blocks' ) }
					</div>
				</div>
			);
		}

		// Custom byline active warning
		if ( customBylineActive ) {
			return (
				<div { ...blockProps }>
					{ inspectorControls }
					<div className="newspack-author-profile-disabled">
						<Notice status="warning" isDismissible={ false }>
							{ __( 'Author bio is hidden because Custom Byline is active on this post.', 'newspack-blocks' ) }
						</Notice>
					</div>
				</div>
			);
		}

		// No authors found
		if ( ! authorsToRender.length ) {
			return (
				<div { ...blockProps }>
					{ inspectorControls }
					<Placeholder className="newspack-blocks-author-profile" icon={ postAuthor } label={ __( 'Author Profile', 'newspack-blocks' ) }>
						{ __( 'No authors found for this post.', 'newspack-blocks' ) }
					</Placeholder>
				</div>
			);
		}

		// Render contextual authors
		return (
			<div { ...blockProps }>
				{ inspectorControls }
				{ blockControls }
				{ authorsToRender.map( authorData => (
					<SingleAuthor
						key={ authorData.id }
						author={ { ...authorData, social: getSocialLinks( authorData ) } }
						attributes={ attributes }
					/>
				) ) }
			</div>
		);
	}

	// SPECIFIC MODE: Author selected - render it
	if ( author ) {
		return (
			<div { ...blockProps }>
				{ inspectorControls }
				{ blockControls }
				<SingleAuthor author={ { ...author, social: getSocialLinks( author ) } } attributes={ attributes } />
			</div>
		);
	}

	// SPECIFIC MODE: No author selected - show search
	return (
		<div { ...blockProps }>
			{ inspectorControls }
			<Placeholder className="newspack-blocks-author-profile" icon={ postAuthor } label={ __( 'Author Profile', 'newspack-blocks' ) }>
				{ error && (
					<Notice status="error" isDismissible={ false }>
						{ error }
					</Notice>
				) }
				{ isLoading && (
					<div className="is-loading">
						{ __( 'Fetching author info…', 'newspack-blocks' ) }
						<Spinner />
					</div>
				) }
				{ ! isLoading && (
					<AutocompleteWithSuggestions
						label={ __( 'Search for an author to display', 'newspack-blocks' ) }
						help={ __( 'Begin typing name, click autocomplete result to select.', 'newspack-blocks' ) }
						fetchSuggestions={ async ( search = null, offset = 0 ) => {
							// Reset suggestions in state.
							setSuggestions( null );

							// If we already have a selected author, no need to fetch suggestions.
							if ( authorId && ! error ) {
								return [];
							}

							const response = await apiFetch( {
								parse: false,
								path: addQueryArgs( '/newspack-blocks/v1/authors', {
									search,
									offset,
									fields: 'id,name',
								} ),
							} );

							const total = parseInt( response.headers.get( 'x-wp-total' ) || 0, 10 );
							const authors = await response.json();

							// Set max items for "load more" functionality in suggestions list.
							if ( ! maxItemsToSuggest && ! search ) {
								setMaxItemsToSuggest( total );
							}

							const _suggestions = authors.map( _author => ( {
								value: _author.id,
								label: decodeEntities( _author.name ) || __( '(no name)', 'newspack-blocks' ),
								isGuestAuthor: _author.is_guest,
							} ) );

							setSuggestions( _suggestions );

							return _suggestions;
						} }
						maxItemsToSuggest={ maxItemsToSuggest }
						onChange={ items => {
							let selectionIsGuest = false;
							const selection = items[ 0 ];

							// We need to check whether the selected author is a guest author or not.
							if ( suggestions ) {
								suggestions.forEach( suggestion => {
									if ( parseInt( selection?.value, 10 ) === parseInt( suggestion?.value, 10 ) && suggestion?.isGuestAuthor ) {
										selectionIsGuest = true;
									}
								} );
							}

							setAttributes( {
								authorId: parseInt( selection?.value || 0, 10 ),
								isGuestAuthor: selectionIsGuest,
							} );
						} }
						postTypeLabel={ __( 'author', 'newspack-blocks' ) }
						postTypeLabelPlural={ __( 'authors', 'newspack-blocks' ) }
						selectedItems={ [] }
					/>
				) }
			</Placeholder>
		</div>
	);
};

export default AuthorProfile;
