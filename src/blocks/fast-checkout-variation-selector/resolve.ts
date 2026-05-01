/**
 * Pure helpers for variation resolution.
 */

export interface VariationData {
	id: number;
	attributes: Record< string, string >;
	is_in_stock: boolean;
}

export function attributesMatch( variation: VariationData, selection: Record< string, string > ): boolean {
	return Object.entries( variation.attributes ).every( ( [ key, value ] ) => selection[ key ] === value );
}

export function resolveVariationId( variations: VariationData[], selection: Record< string, string > ): number | null {
	const required = new Set< string >();
	variations.forEach( v => Object.keys( v.attributes ).forEach( k => required.add( k ) ) );
	for ( const key of required ) {
		if ( ! selection[ key ] ) {
			return null;
		}
	}
	const match = variations.find( v => attributesMatch( v, selection ) );
	return match ? match.id : null;
}
