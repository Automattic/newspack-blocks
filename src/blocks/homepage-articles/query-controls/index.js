/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { Component, Fragment } from '@wordpress/element';
import { QueryControls as BaseControl, SelectControl, ToggleControl } from '@wordpress/components';

class QueryControls extends Component {
	render = () => {
		const {
			authorList,
			postList,
			tagsList,
			onAuthorChange,
			onSingleChange,
			onTagChange,
			selectedSingleId,
			selectedAuthorId,
			selectedTagId,
			singleMode,
			onSingleModeChange,
		} = this.props;
		return [
			<ToggleControl
				checked={ singleMode }
				onChange={ onSingleModeChange }
				label={ __( 'Choose specific story' ) }
			/>,
			singleMode && (
				<SelectControl
					key="query-controls-single-post-select"
					label={ __( 'Display One Specific Post' ) }
					value={ selectedSingleId }
					options={ [
						{ label: __( '-- Select Post --' ), value: '' },
						...( postList || [] ).map( post => ( { label: post.title.rendered, value: post.id } ) ),
					] }
					onChange={ onSingleChange }
				/>
			),
			! singleMode && <BaseControl { ...this.props } />,
			! singleMode && onAuthorChange && (
				<SelectControl
					key="query-controls-author-select"
					label={ __( 'Author' ) }
					value={ selectedAuthorId }
					options={ [
						{ label: __( 'Any author' ), value: '' },
						...( authorList || [] ).map( author => ( { label: author.name, value: author.id } ) ),
					] }
					onChange={ onAuthorChange }
				/>
			),
			! singleMode && onTagChange && (
				<SelectControl
					key="query-controls-tag-control"
					label={ __( 'Tag' ) }
					value={ selectedTagId }
					options={ [
						{ label: __( 'No tag filter' ), value: '' },
						...( tagsList || [] ).map( tag => ( { label: tag.name, value: tag.id } ) ),
					] }
					onChange={ onTagChange }
				/>
			),
		];
	};
}

QueryControls.defaultProps = {
	authorList: [],
	postList: [],
	tagsList: [],
};

export default QueryControls;
