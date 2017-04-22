import { Diagnostic, Range, Position, DiagnosticSeverity, DiagnosticCollection, TextDocumentChangeEvent } from 'vscode';
import { ODataMode } from './odataMode';
import * as syntax from "./odataSyntax";

class DiagnosticSyntaxVisitor extends syntax.SyntaxWalker {
    errors: syntax.ErrorSyntax[];

    getErrors(node: syntax.SyntaxNode): syntax.ErrorSyntax[] {
        this.errors = new Array<syntax.ErrorSyntax>();
        this.visit(node);
        return this.errors;
    }

    visitDefault(node: syntax.SyntaxNode) {
        if (node.error) {
            this.errors.push(node.error);
        }
    }
}

class ODataBinder extends syntax.SyntaxWalker {
    diagnostics: Diagnostic[];
    // metadata:
    // currentEntitySet

    bind(node: syntax.SyntaxNode): Diagnostic[] {
        this.diagnostics = new Array<Diagnostic>();
        this.visit(node);
        return this.diagnostics;
    }

    visitPrimitiveProperty(node: syntax.SelectProprty) {
        if (node.propertyName !== "stasiu") {
            this.diagnostics.push(new Diagnostic(
                createRangeFromSpan(node.span),
                `Cannot find property '${node.propertyName}'.`,
                DiagnosticSeverity.Error));
        } else {
            node.symbol = {
                error: "lol"
            }
        }
    }
}

function createRangeFromSpan(span: syntax.Span): Range {
    return new Range(
        new Position(span.start.line - 1, span.start.column - 1),
        new Position(span.end.line - 1, span.end.column - 1));
}


export class ODataDiagnosticProvider {
    private runner: NodeJS.Timer;
    private diagnostics: DiagnosticCollection;

    constructor(diagnostics: DiagnosticCollection) {
        this.diagnostics = diagnostics;
    }

    public onDidChangeTextDocument = (e: TextDocumentChangeEvent) => {
        if (e.document.languageId !== ODataMode.language) {
            return;
        }

        if (this.runner != null) {
            clearTimeout(this.runner);
        }

        this.runner = setTimeout(() => {
            this.onDidChangeTextDocumentStable(e);
            this.runner = null;
        }, 500);
    }

    private onDidChangeTextDocumentStable = (e: TextDocumentChangeEvent) => {
        this.diagnostics.clear();
        let uri = e.document.uri;

        try {
            let tree = syntax.Parser.parse(e.document.getText())
            let diagnostics = new Array<Diagnostic>();

            let diagnosticSyntaxVisitor = new DiagnosticSyntaxVisitor();
            let errors = diagnosticSyntaxVisitor.getErrors(tree.root);

            if (errors.length > 0) {
                let errorNode = errors[0];
                diagnostics = diagnostics.concat([
                    new Diagnostic(
                        new Range(
                            new Position(errorNode.span.start.line - 1, errorNode.span.start.column - 1),
                            new Position(errorNode.span.end.line - 1, errorNode.span.end.column - 1)),
                        "Unexpected character detected.",
                        DiagnosticSeverity.Error)
                ]);
            }

            let binder = new ODataBinder();
            diagnostics = diagnostics.concat(binder.bind(tree.root));
            
            this.diagnostics.set(uri, diagnostics);
        } catch (error) {
           if (error instanceof syntax.SyntaxError) {
                let syntaxError = <syntax.SyntaxError>error;

                this.diagnostics.set(e.document.uri, [
                    new Diagnostic(
                        createRangeFromSpan(syntaxError.location),
                        syntaxError.message,
                        DiagnosticSeverity.Error)
                ]);
            }

        }
    }
}
