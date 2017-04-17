import * as vscode from 'vscode';
import { ODataMode } from './odataMode';
import * as Parser from "./odataParser";


export class ODataDiagnosticProvider {
    private runner: NodeJS.Timer;
    private diagnostics: vscode.DiagnosticCollection;

    constructor(diagnostics: vscode.DiagnosticCollection) {
        this.diagnostics = diagnostics;
    }

    public onDidChangeTextDocument = (e: vscode.TextDocumentChangeEvent) => {
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

    private onDidChangeTextDocumentStable = (e: vscode.TextDocumentChangeEvent) => {
        this.diagnostics.clear();

        try {
            let tree = Parser.parse(e.document.getText())

            if (tree.error) {
                let errorNode = tree.error;
                this.diagnostics.set(e.document.uri, [
                    new vscode.Diagnostic(
                        new vscode.Range(
                            new vscode.Position(errorNode.span.start.line - 1, errorNode.span.start.column - 1),
                            new vscode.Position(errorNode.span.end.line - 1, errorNode.span.end.column - 1)),
                        "Unexpected character detected.",
                        vscode.DiagnosticSeverity.Error)
                ]);
            }


        } catch (error) {
            let syntaxError = <Parser.SyntaxError>error;

            this.diagnostics.set(e.document.uri, [
                new vscode.Diagnostic(
                    new vscode.Range(
                        new vscode.Position(syntaxError.location.start.line - 1, syntaxError.location.start.column - 1),
                        new vscode.Position(syntaxError.location.end.line - 1, syntaxError.location.end.column - 1)),
                    syntaxError.message,
                    vscode.DiagnosticSeverity.Error)
            ]);
        }
    }
}
