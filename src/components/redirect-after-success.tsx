/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { TextControl, SelectControl } from '@wordpress/components';

type Props = {
	attributes: {
		afterSuccessBehavior: string;
		afterSuccessButtonLabel: string;
		afterSuccessURL: string;
	};
	setAttributes: ( attributes: Partial< Props[ 'attributes' ] > ) => void;
};

const RedirectAfterSuccess = ( { attributes, setAttributes }: Props ) => (
	<>
		<SelectControl
			label={ __( 'Post-Checkout Button', 'newspack-blocks' ) }
			help={ __(
				'Select whether the user should be presented with a button to navigate after a successful purchase.',
				'newspack-blocks'
			) }
			value={ attributes.afterSuccessBehavior }
			options={ [
				{ label: __( 'Do not show a button', 'newspack-blocks' ), value: '' },
				{ label: __( 'Go to a custom URL', 'newspack-blocks' ), value: 'custom' },
				{ label: __( 'Go to the previous page', 'newspack-blocks' ), value: 'referrer' },
			] }
			onChange={ ( value: string ) => {
				setAttributes( { afterSuccessBehavior: value.toString() } );
			} }
		/>
		{ attributes.afterSuccessBehavior !== '' && (
			<>
				<TextControl
					label={ __( 'Button Label', 'newspack-blocks' ) }
					placeholder={ __( 'Continue browsing', 'newspack-blocks' ) }
					value={ attributes.afterSuccessButtonLabel || '' }
					onChange={ ( value: string ) => setAttributes( { afterSuccessButtonLabel: value } ) }
				/>
				{ attributes.afterSuccessBehavior === 'custom' && (
					<TextControl
						label={ __( 'Custom URL', 'newspack-blocks' ) }
						placeholder={ __( 'https://example.com', 'newspack-blocks' ) }
						value={ attributes.afterSuccessURL || '' }
						onChange={ ( value: string ) => setAttributes( { afterSuccessURL: value } ) }
					/>
				) }
			</>
		) }
	</>
);

export default RedirectAfterSuccess;
