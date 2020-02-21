/**
 * WordPress dependencies.
 */
import { parse } from '@wordpress/blocks';
import { PanelBody, Spinner } from '@wordpress/components';
import { compose } from '@wordpress/compose';
import { withDispatch, withSelect } from '@wordpress/data';
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
	insert = content => {
		const { getBlockSelectionEnd, getBlockIndex, insertBlocks } = this.props;
		const currentBlock = getBlockSelectionEnd();
		const insertionIndex = currentBlock ? getBlockIndex( currentBlock ) + 1 : 0;
		insertBlocks( parse( content ), insertionIndex );
	};
	render() {
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
														onClick={ () => this.insert( content ) }
														onKeyDown={ event => {
															if ( ENTER === event.keyCode || SPACE === event.keyCode ) {
																event.preventDefault();
																this.insert( content );
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

const PatternsSidebarWithDispatch = compose( [
	withSelect( select => {
		const { getBlockSelectionEnd, getBlockIndex } = select( 'core/block-editor' );
		return { getBlockSelectionEnd, getBlockIndex };
	} ),
	withDispatch( dispatch => {
		const { insertBlocks } = dispatch( 'core/block-editor' );
		return { insertBlocks };
	} ),
] )( PatternsSidebar );

const newspackBlocksData = window && window.newspack_blocks_data ? window.newspack_blocks_data : {};
const { patterns } = newspackBlocksData;
if ( patterns && patterns.length ) {
	registerPlugin( 'newspack-blocks-sidebar', {
		render: PatternsSidebarWithDispatch,
	} );
}
