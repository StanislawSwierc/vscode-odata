'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

import { ODataMode } from './odataMode';
import { ODataDiagnosticProvider } from './odataDiagnostic';

import {
    TextDocument, Position, CompletionItem, CompletionList, CompletionItemKind, Hover, Range, SymbolInformation, Diagnostic,
    TextEdit, FormattingOptions, MarkedString, CancellationToken, ProviderResult
} from 'vscode';


class ODataCompletionItemProvider implements vscode.CompletionItemProvider {
    triggerCharacters = [".", "=", ",", "(", "/", "$", "'"];

    provideCompletionItems(document: TextDocument, position: Position, token: CancellationToken): ProviderResult<CompletionList> {
        if (document.getWordRangeAtPosition(position, /\$[a-zA-Z]*/)) {
            return new CompletionList([
                {
                    label: "$apply",
                    insertText: "apply",
                    filterText: "apply",
                    documentation: "Applies set transformations, separated by forward slashes.",
                    kind: CompletionItemKind.Keyword
                },
                {
                    label: "$filter",
                    insertText: "filter",
                    filterText: "filter",
                    documentation: "Filters collection of resources.",
                    kind: CompletionItemKind.Keyword
                },
                {
                    label: "$select",
                    insertText: "select",
                    filterText: "select",
                    documentation: "Selects a specific set of properties for each entity or complex type.",
                    kind: CompletionItemKind.Keyword
                },
                {
                    label: "$skip",
                    insertText: "skip",
                    filterText: "skip",
                    documentation: "Requests a number of items in the queried collection to be skipped and not included in the result.",
                    kind: CompletionItemKind.Keyword
                },
                {
                    label: "$top",
                    insertText: "top",
                    filterText: "top",
                    documentation: "Limits the number of items in the queried collection to be included in the result.",
                    kind: CompletionItemKind.Keyword
                }
                // TODO: add the rest. 
            ]);
        }

        return new CompletionList([
            {
                label: "stasiu",
                insertText: "stasiu to super bohater jest",
                documentation: "super doc",
                kind: CompletionItemKind.Field,

            }
        ]);
    }
}

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    console.log('Congratulations, your extension "vscode-odata" is now active!');

    // The command has been defined in the package.json file
    // Now provide the implementation of the command with  registerCommand
    // The commandId parameter must match the command field in package.json
    let disposable = vscode.commands.registerCommand('extension.sayHello', () => {
        // The code you place here will be executed every time your command is executed

        // Display a message box to the user
        vscode.window.showInformationMessage('Hello World!');
    });

    let completionItemProvider = new ODataCompletionItemProvider();
    context.subscriptions.push(vscode.languages.registerCompletionItemProvider(ODataMode,
        completionItemProvider, ...completionItemProvider.triggerCharacters));

    let diagnosticCollection = vscode.languages.createDiagnosticCollection('odata-diagnostics');
    let diagnosticsProvider = new ODataDiagnosticProvider(diagnosticCollection);
    vscode.workspace.onDidChangeTextDocument(diagnosticsProvider.onDidChangeTextDocument, null, context.subscriptions);

    context.subscriptions.push(disposable)  ;
}

// this method is called when your extension is deactivated
export function deactivate() {
}