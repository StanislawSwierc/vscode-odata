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
    'Error',
    'Select',
    'PrimitiveProperty',
    'NavigationProperty'
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

export interface ErrorSyntax extends SyntaxNode {
}

export interface SelectSyntax extends SyntaxNode {
    children: SelectProprty[]
}

export interface SelectProprty extends SyntaxNode {
    propertyName: string;
}

export class SyntaxVisitor<T> {    
    visit(node : SyntaxNode) : T {
        // Dispatch on node kind instead of delegating dispatching to node
        // classes because the instances are created by pegjs parser.
        switch(node.kind) {
            case SyntaxKind.Error:
                return this.visitError(node);
            // case SyntaxKind.navigationProperty:
            //     return this.visitNavigationProperty
            case SyntaxKind.PrimitiveProperty:
                return this.visitPrimitiveProperty(node as SelectProprty);
            case SyntaxKind.Select:
                return this.visitSelect(node as SelectSyntax);
			default:
				return this.visitDefault(node);
				// TODO: Uncomment after parser is fixed.
				//throw new RangeError(`Unknown SyntaxKind '${node.kind}'`);
        }
    }

    visitDefault(node: SyntaxNode) : T {
        return undefined;
    }

    visitError(node : ErrorSyntax) : T {
        return this.visitDefault(node);
    }

    visitSelect(node : SelectSyntax) : T {
        return this.visitDefault(node);
    }

    visitPrimitiveProperty(node : SelectProprty) : T {
        return this.visitDefault(node);
    }
}

export class SyntaxWalker extends SyntaxVisitor<void> {
    visitSelect(node : SelectSyntax) {
		node.children.forEach(n => this.visitDefault(node));
        this.visitDefault(node);
    }
}