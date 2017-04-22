import { Location, LocationRange, SyntaxError, parse } from './odataParser';
export { Location, LocationRange, SyntaxError } from './odataParser';

// https://basarat.gitbooks.io/typescript/docs/types/literal-types.html
function strEnum<T extends string>(o: Array<T>): {[K in T]: K} {
    return o.reduce((res, key) => {
        res[key] = key;
        return res;
    }, Object.create(null));
}

export const SyntaxKind = strEnum([
    "Uri",
    'Error',
    'Select',
    'PrimitiveProperty',
    'NavigationProperty'
])

export type SyntaxKind = keyof typeof SyntaxKind;

export interface Position {
    offset: number;
    line: number;
    column: number;
}

export interface Span {
    start: Position,
    end: Position,
}

export class SyntaxTree {
    root: SyntaxNode;

    constructor(root: SyntaxNode) {
        this.root = root;
    }
}

export interface Symbol {
    error?: any; 
}

export interface SyntaxNode {
    kind: SyntaxKind;
    span: Span;
    error?: SyntaxNode;
    symbol?: Symbol;
}

export interface ErrorSyntax extends SyntaxNode {
}

export interface SelectSyntax extends SyntaxNode {
    children: SelectProprty[]
}

export interface SelectProprty extends SyntaxNode {
    propertyName: string;
}

export interface UriSyntax extends SyntaxNode {
    select?: SelectSyntax;
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
              case SyntaxKind.Uri:
                return this.visitUri(node as UriSyntax);
			default:
				throw new RangeError(`Unknown SyntaxKind '${node.kind}'`);
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

    visitUri(node : UriSyntax) : T {
        return this.visitDefault(node);
    }
}

export class SyntaxWalker extends SyntaxVisitor<void> {
    visitSelect(node : SelectSyntax) {
		this.visitDefault(node);
        node.children.forEach(n => this.visit(n));
    }

    visitUri(node : UriSyntax) {
        this.visitDefault(node);
        if (node.select) {
            this.visitSelect(node.select as SelectSyntax);
        }
    }
}

export class Parser {
    static parse(text: string) : SyntaxTree {
        let root = parser.parse(text);
        return new SyntaxTree(root);
    }
}
