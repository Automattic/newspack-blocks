/**
 * WordPress dependencies
 */
import apiFetch from '@wordpress/api-fetch';
import { parse } from '@wordpress/blocks';
import { Button, PanelBody, Spinner } from '@wordpress/components';
import { compose } from '@wordpress/compose';
import { withDispatch, withSelect } from '@wordpress/data';
import { Component } from '@wordpress/element';
import { PluginSidebar } from '@wordpress/edit-post';
import { __ } from '@wordpress/i18n';
import { registerPlugin } from '@wordpress/plugins';

/**
 * Internal dependencies
 */
import Icon from '@material-ui/icons/ViewQuilt';

class PatternsSidebar extends Component {
	state = { patternGroups: null };
	componentDidMount = () => {
		const { currentPostType } = this.props;
		apiFetch( {
			path: `/newspack-blocks/v1/patterns/${ currentPostType }`,
		} ).then( patternGroups => this.setState( { patternGroups } ) );
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
								{ patternGroup.items &&
									patternGroup.items.map( ( pattern, patternIndex ) => (
										<Button
											key={ patternIndex }
											onClick={ () => insertBlocks( parse( pattern.content ) ) }
										>
											<img src={ pattern.icon } alt={ pattern.name } title={ pattern.name } />
										</Button>
									) ) }
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

const PatternsSidebarWithDispatch = compose( [
	withSelect( select => {
		const { getCurrentPostType } = select( 'core/editor' );
		return { currentPostType: getCurrentPostType() };
	} ),
	withDispatch( dispatch => {
		const { insertBlocks } = dispatch( 'core/editor' );
		return { insertBlocks };
	} ),
] )( PatternsSidebar );

registerPlugin( 'newspack-blocks-sidebar', {
	render: PatternsSidebarWithDispatch,
} );
