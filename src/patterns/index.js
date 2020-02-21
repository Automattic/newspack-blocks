/**
 * WordPress dependencies.
 */
import { parse } from '@wordpress/blocks';
import { PanelBody, Spinner } from '@wordpress/components';
import { withDispatch } from '@wordpress/data';
import { Component } from '@wordpress/element';
import { PluginSidebar } from '@wordpress/edit-post';
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
		return (
			<PluginSidebar
				name="newspack-blocks-sidebar"
				icon={ <Icon /> }
				title={ __( 'Newspack Patterns', 'newspack-blocks' ) }
			>
				{ patternGroups &&
					patternGroups
						.filter(
							patternGroup => patternGroup.title && patternGroup.items && patternGroup.items.length
						)
						.map( ( patternGroup, patternGroupIndex ) => (
							<PanelBody
								title={ patternGroup.title }
								initialOpen={ true }
								key={ patternGroupIndex }
							>
								<div className="editor-block-styles block-editor-block-styles newspack-patterns-block-styles">
									{ patternGroup.items &&
										patternGroup.items.map( ( pattern, patternIndex ) => (
											<div
												key={ patternIndex }
												className="editor-block-styles__item block-editor-block-styles__item"
												onClick={ () => insertBlocks( parse( pattern.content ) ) }
												onKeyDown={ event => {
													if ( ENTER === event.keyCode || SPACE === event.keyCode ) {
														event.preventDefault();
														insertBlocks( parse( pattern.content ) );
													}
												} }
												role="button"
												tabIndex="0"
												aria-label={ pattern.title }
											>
												<div className="editor-block-styles__item-preview block-editor-block-styles__item-preview">
													{ pattern.icon && (
														<img src={ pattern.icon } alt={ __( 'Preview', 'newspack-block' ) } />
													) }
												</div>
												<div className="editor-block-styles__item-label block-editor-block-styles__item-label">
													{ pattern.title }
												</div>
											</div>
										) ) }
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
