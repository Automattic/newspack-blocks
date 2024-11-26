import save from './save';
import metadata from './block.json';

const v1 = {
	attributes: {
		afterSuccessButtonLabel: {
			type: "string",
			default: "Continue browsing"
		},
	},

	...metadata,
	save
}
export default [ v1 ];