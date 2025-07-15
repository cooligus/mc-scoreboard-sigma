export interface UserFunction {
	name: string;
	scriptPrefix: string;
	format: string;
}

export interface Command {
	id: string;
	user?: UserFunction;
	userName: string;
	span: number;
	content: string;
	isCustom: boolean;
}
