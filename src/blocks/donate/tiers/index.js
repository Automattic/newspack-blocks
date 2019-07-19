/**
 * WordPress dependencies
 */
import {
	Button,
	Dashicon,
	Panel,
	PanelBody,
	TextareaControl,
	TextControl,
} from '@wordpress/components';
import { Component } from '@wordpress/element';
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import './style.scss';

export class Tiers extends Component {
	constructor() {
		super( ...arguments );
		this.state = {
			selectedCell: null,
		};
	}

	onDeleteTier = e => {
		const index = parseInt( e.target.getAttribute( 'data-id' ) );
		const { tiers, onChange } = this.props;

		const newTiers = tiers.slice( 0 );
		newTiers.splice( index, 1 );
		onChange( newTiers );
	};

	onAddTier = e => {
		const { tiers, onChange } = this.props;
		onChange( [ ...tiers, { title: __( 'Tier 1' ), minimum: 0 } ] );
	};

	setField( field, value, index ) {
		const { tiers, onChange } = this.props;

		const newTiers = tiers.slice( 0 );
		newTiers[ index ][ field ] = value;
		onChange( newTiers );
	}

	render() {
		const { tiers } = this.props;
		const rows = tiers.map( ( tier, index ) => (
			<PanelBody title={ tier.title } key={ index } initialOpen={ true }>
				<TextControl
					label="Tier Name"
					value={ tier.title }
					onChange={ value => this.setField( 'title', value, index ) }
				/>
				<TextControl
					label="Minimum amount"
					value={ tier.minimum }
					onChange={ value => this.setField( 'minimum', value, index ) }
				/>
				<Button
					data-id={ index }
					onClick={ this.onDeleteTier }
					className="component__tiers__delete-btn"
				>
					<Dashicon icon="trash" size="15" />
					{ __( 'Delete Tier' ) }
				</Button>
			</PanelBody>
		) );
		return (
			<div className="component__tiers">
				<Panel className="component__tiers__panel">{ rows }</Panel>
				<Button isPrimary onClick={ () => this.onAddTier() }>
					{ __( 'Add Tier' ) }
				</Button>
			</div>
		);
	}
}

Tiers.defaultProps = {
	tiers: Object.freeze( [] ),
	onChange: () => {},
};

export default Tiers;
