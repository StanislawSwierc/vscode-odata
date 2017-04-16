import * as vscode from 'vscode';
import { ODataMode } from './odataMode';

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

        this.diagnostics.set(e.document.uri, [new vscode.Diagnostic(new vscode.Range(new vscode.Position(1, 1) , new vscode.Position(1, 10)), "sdf", vscode.DiagnosticSeverity.Error)]);
    }
}