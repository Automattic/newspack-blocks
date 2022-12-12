/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { TextControl, CheckboxControl, Button } from '@wordpress/components';

/**
 * Internal dependencies
 */
import type { AdditionalField, EditProps } from '../../types';

const getUniqID = () => Math.random().toString( 36 ).substring( 2, 7 );

const AdditionalFields = ( {
	attributes,
	setAttributes,
}: Pick< EditProps, 'attributes' | 'setAttributes' > ) => {
	return (
		<>
			<p>
				{ __(
					'Collect additional data from donors by defining custom form fields.',
					'newspack-blocks'
				) }
			</p>
			<div className="newspack-blocks-additional-fields-editor">
				{ attributes.additionalFields.map( ( field, i ) => {
					type EditableKey = keyof Omit< AdditionalField, 'type' >;
					const updateField = ( key: EditableKey ) => ( value: string | boolean ) => {
						const additionalFields = [ ...attributes.additionalFields ];
						// eslint-disable-next-line @typescript-eslint/ban-ts-comment
						// @ts-ignore – `key` is a valid key of `AdditionalField`.
						additionalFields[ i ][ key ] = value;
						setAttributes( { additionalFields } );
					};
					const fieldProps = [
						[ 'name', __( 'Name', 'newspack' ) ],
						[ 'label', __( 'Label', 'newspack' ) ],
					] as [ EditableKey, string ][];
					return (
						<div key={ i }>
							{ fieldProps.map( ( [ key, label ] ) => (
								<TextControl
									key={ key }
									label={ label }
									placeholder={ label }
									value={ field[ key ] }
									onChange={ updateField( key ) }
								/>
							) ) }
							<CheckboxControl
								label={ __( 'Required', 'newspack' ) }
								checked={ field.isRequired }
								onChange={ updateField( 'isRequired' ) }
							/>
							<Button
								isDestructive
								onClick={ () =>
									setAttributes( {
										additionalFields: attributes.additionalFields.filter(
											( value, index ) => index !== i
										),
									} )
								}
							>
								{ __( 'Remove this field', 'newspack' ) }
							</Button>
						</div>
					);
				} ) }
				<Button
					isPrimary
					onClick={ () =>
						setAttributes( {
							additionalFields: [
								...attributes.additionalFields,
								{
									type: 'text',
									name: `field-${ getUniqID() }`,
									label: `Field ${ attributes.additionalFields.length }`,
									isRequired: false,
								},
							],
						} )
					}
				>
					{ __( 'Add a field', 'newspack' ) }
				</Button>
			</div>
		</>
	);
};

export default AdditionalFields;
