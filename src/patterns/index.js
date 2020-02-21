/**
 * WordPress dependencies.
 */
import { parse } from '@wordpress/blocks';
import { PanelBody, Spinner } from '@wordpress/components';
import { withDispatch } from '@wordpress/data';
import { Component, Fragment } from '@wordpress/element';
import { PluginSidebar, PluginSidebarMoreMenuItem } from '@wordpress/edit-post';
import { __ } from '@wordpress/i18n';
import { registerPlugin } from '@wordpress/plugins';
import { ENTER, SPACE } from '@wordpress/keycodes';

/**
 * Material UI dependencies.
 */
import Icon from '@material-ui/icons/ViewQuilt';

/**
 * Internal dependencies.
 */
import './style.scss';

class PatternsSidebar extends Component {
	state = {
		patternGroups: window && window.newspack_blocks_data && window.newspack_blocks_data.patterns,
	};
	render() {
		const { insertBlocks } = this.props;
		const { patternGroups } = this.state;
		const sidebarTitle = __( 'Newspack Patterns', 'newspack-blocks' );
		const sidebarId = 'newspack-blocks-sidebar';
		return (
			<Fragment>
				<PluginSidebar name={ sidebarId } icon={ <Icon /> } title={ sidebarTitle }>
					{ patternGroups &&
						patternGroups
							.filter(
								patternGroup =>
									patternGroup.title && patternGroup.items && patternGroup.items.length
							)
							.map( ( patternGroup, patternGroupIndex ) => (
								<PanelBody
									title={ patternGroup.title }
									initialOpen={ true }
									key={ patternGroupIndex }
								>
									<div className="editor-block-styles block-editor-block-styles newspack-patterns-block-styles">
										{ patternGroup.items &&
											patternGroup.items.map(
												( { preview_image: previewImage, content, title }, patternIndex ) => (
													<div
														key={ patternIndex }
														className="editor-block-styles__item block-editor-block-styles__item"
														onClick={ () => insertBlocks( parse( content ) ) }
														onKeyDown={ event => {
															if ( ENTER === event.keyCode || SPACE === event.keyCode ) {
																event.preventDefault();
																insertBlocks( parse( content ) );
															}
														} }
														role="button"
														tabIndex="0"
														aria-label={ title }
													>
														<div className="editor-block-styles__item-preview block-editor-block-styles__item-preview">
															<img src={ previewImage } alt={ __( 'Preview', 'newspack-block' ) } />
														</div>
														<div className="editor-block-styles__item-label block-editor-block-styles__item-label">
															{ title }
														</div>
													</div>
												)
											) }
									</div>
								</PanelBody>
							) ) }
					{ ! patternGroups && (
						<PanelBody>
							<Spinner />
							{ __( 'Loading patterns', 'newspack-blocks' ) }
						</PanelBody>
					) }
				</PluginSidebar>
				<PluginSidebarMoreMenuItem target={ sidebarId } icon=<Icon />>
					{ sidebarTitle }
				</PluginSidebarMoreMenuItem>
			</Fragment>
		);
	}
}

const PatternsSidebarWithDispatch = withDispatch( dispatch => {
	const { insertBlocks } = dispatch( 'core/editor' );
	return { insertBlocks };
} )( PatternsSidebar );

const newspackBlocksData = window && window.newspack_blocks_data ? window.newspack_blocks_data : {};
const { patterns } = newspackBlocksData;
if ( patterns && patterns.length ) {
	registerPlugin( 'newspack-blocks-sidebar', {
		render: PatternsSidebarWithDispatch,
	} );
}
