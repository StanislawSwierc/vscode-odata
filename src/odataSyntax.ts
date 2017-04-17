// https://basarat.gitbooks.io/typescript/docs/types/literal-types.html
function strEnum<T extends string>(o: Array<T>): {[K in T]: K} {
    return o.reduce((res, key) => {
        res[key] = key;
        return res;
    }, Object.create(null));
}

export interface Position {
	offset: number;
	line: number;
	column: number;
}

export interface Span {
	start: Position,
	end: Position,
}

export const SyntaxKind = strEnum([
	'error',
    'select',
    'primitiveProperty',
    'navigationProperty'
])

export type SyntaxKind = keyof typeof SyntaxKind;

export interface SyntaxTree {
	root: SyntaxNode;
}

export interface SyntaxNode {
	kind: SyntaxKind;
	span: Span;
	error: SyntaxNode;
}

export interface SelectSyntax extends SyntaxNode {
	children: SelectProprty[]
}

export interface SelectProprty extends SyntaxNode {
	propertyName: string;
}
