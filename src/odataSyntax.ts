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
            case SyntaxKind.error:
                return this.visitError(node);
            // case SyntaxKind.navigationProperty:
            //     return this.visitNavigationProperty
            case SyntaxKind.primitiveProperty:
                return this.visitPrimitiveProperty(node as SelectProprty);
            case SyntaxKind.select:
                return this.visitSelect(node as SelectSyntax);
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