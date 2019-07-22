/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { Component, Fragment } from '@wordpress/element';
import { QueryControls as BaseControl, SelectControl } from '@wordpress/components';

class QueryControls extends Component {
	render = () => {
		const { authorList, onAuthorChange, selectedAuthorId } = this.props;
		console.log( authorList );
		return [
			<BaseControl { ...this.props } />,
			onAuthorChange && (
				<SelectControl
					key="query-controls-author-select"
					label={ __( 'Author' ) }
					value={ selectedAuthorId }
					options={ [
						{ label: __( 'Any author' ), value: '' },
						...authorList.map( author => ( { label: author.name, value: author.id } ) ),
					] }
					onChange={ onAuthorChange }
				/>
			),
		];
	};
}

export default QueryControls;
