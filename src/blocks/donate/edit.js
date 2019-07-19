/**
 * External dependencies
 */
import classNames from 'classnames';

/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { createRef, Component, Fragment } from '@wordpress/element';
import { InspectorControls } from '@wordpress/editor';
import {
	CheckboxControl,
	ToggleControl,
	PanelBody,
	PanelRow,
	QueryControls,
	RangeControl,
	Toolbar,
	Dashicon,
	Placeholder,
	Spinner,
} from '@wordpress/components';

/**
 * Internal dependencies
 */
import Tiers from './tiers';
import donateBlock from './donate';

class Edit extends Component {
	constructor( props ) {
		super( props );
		this.blockRef = createRef();
	}

	componentDidMount() {
		donateBlock( this.blockRef.current, true );
	}

	render() {
		/**
		 * Constants
		 */
		const { attributes, className, setAttributes } = this.props;
		const { tiers, monthly_term, annual_term, one_time } = attributes;
		return (
			<Fragment>
				<div className={ className } ref={ this.blockRef }>
					<form>
						<ul className="levels">
							{ tiers.map( ( tier, index ) => (
								<li data-tier={ index } data-minimum={ tier.minimum } data-title={ tier.title }>
									<button href="#" key={ index }>
										{ tier.title }
									</button>
								</li>
							) ) }
						</ul>
						<div className="lower">
							<div className="purchase-row">
								<div className="amount">
									<span className="currency">$</span>
									<input type="text" />
								</div>
								<ul className="term">
									{ monthly_term && (
										<li data-term="monthly">
											<button>per month</button>
										</li>
									) }
									{ annual_term && (
										<li data-term="annual">
											<button>per year</button>
										</li>
									) }
									{ one_time && (
										<li data-term="one-time">
											<button>one time</button>
										</li>
									) }
								</ul>
							</div>
							<p className="membership-description">
								{ __( 'This donation will make you a ' ) }
								<span className="tier-name">Level 1</span> { __( 'member.' ) }
							</p>
							<button className="primary">Donate now</button>
						</div>
					</form>
				</div>
				<InspectorControls>
					<PanelBody title={ __( 'Tiers' ) }>
						<Tiers
							tiers={ tiers }
							onChange={ value => {
								setAttributes( { tiers: value } );
							} }
						/>
					</PanelBody>
					<PanelBody title={ __( 'Term Options' ) }>
						<CheckboxControl
							label={ __( 'Monthly term' ) }
							value={ monthly_term }
							onChange={ checked => setAttributes( { monthly_term: checked } ) }
						/>
						<CheckboxControl
							label={ __( 'Annual term' ) }
							value={ annual_term }
							onChange={ checked => setAttributes( { annual_term: checked } ) }
						/>
						<CheckboxControl
							label={ __( 'Allow One Time Payments' ) }
							value={ one_time }
							onChange={ checked => setAttributes( { one_time: checked } ) }
						/>
					</PanelBody>
				</InspectorControls>
			</Fragment>
		);
	}
}

export default Edit;
