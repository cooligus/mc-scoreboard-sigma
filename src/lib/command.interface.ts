export interface UserFunction {
    name: string;
    scriptPrefix: string;
    format: string;
}

export interface Command {
    id: string;
    user?: UserFunction;
    span: number;
    content: string;
}