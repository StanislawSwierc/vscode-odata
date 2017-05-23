'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as _ from 'lodash';

import { ODataMode } from './odataMode';
import { ODataDiagnosticProvider } from './odataDiagnostic';
import { ODataDocumentFormattingEditProvider, ODataFormattingConfiguration } from "./odataFormatter";
import { IODataMetadataService, LocalODataMetadataService, ODataMetadataConfiguration } from "./odataMetadata";
import { odataCombine, odataDecode, odataEncode } from "./odataCommands";
import * as syntax from "./odataSyntax";

import {
    TextDocument, Position, CompletionItem, CompletionList, CompletionItemKind, Hover, Range, SymbolInformation, Diagnostic,
    TextEdit, FormattingOptions, MarkedString, CancellationToken, ProviderResult
} from 'vscode';


class ODataCompletionItemProvider implements vscode.CompletionItemProvider {
    triggerCharacters = [".", "=", ",", "(", "/", "$", "'"];
    metadataService: IODataMetadataService;

    constructor(metadataService: IODataMetadataService) {
        this.metadataService = metadataService;
    }

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

        try {
            let tree = syntax.Parser.parse(document.getText());
            return this.metadataService.getMetadataForDocument(document.uri.toString(), tree)
                .then(metadata => {
                    let functions = [
                        new CompletionItem("filter", CompletionItemKind.Function),
                        new CompletionItem("groupby", CompletionItemKind.Function),
                        new CompletionItem("aggregate", CompletionItemKind.Function),
                        new CompletionItem("contains", CompletionItemKind.Function),
                        new CompletionItem("startswith", CompletionItemKind.Function)
                        // TODO: Add all functions
                    ];

                    let items = _.chain(metadata.schemas)
                        .flatMap(s => _.flatMap(s.entityTypes, e => _.flatMap(e.properties, p => p.name)))
                        .uniq()
                        .map(p => new CompletionItem(p, CompletionItemKind.Property))
                        .concat(functions)
                        .value();

                    return new CompletionList(items);
                }, reason => {
                    console.error(reason);
                });
        } catch (error) {
            if (error instanceof syntax.SyntaxError) {
                let syntaxError = <syntax.SyntaxError>error;
                console.error(syntaxError.message);
            } else {
                console.error(error);
            }
        }
    }
}


interface ODataConfiguration extends vscode.WorkspaceConfiguration {
    diagnostic: {
        enable: boolean;
    };
    completion: {
        enable: boolean;
    };
    format: ODataFormattingConfiguration;
    metadata: ODataMetadataConfiguration;
}

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    console.log('Congratulations, your extension "vscode-odata" is now active!');

    let configuration = vscode.workspace.getConfiguration('odata') as ODataConfiguration;

    // The command has been defined in the package.json file
    context.subscriptions.push(vscode.commands.registerCommand('odata.combine', odataCombine));
    context.subscriptions.push(vscode.commands.registerCommand('odata.decode', odataDecode));
    context.subscriptions.push(vscode.commands.registerCommand('odata.encode', odataEncode));


    if (configuration.completion.enable) {
        let metadataService = new LocalODataMetadataService(configuration.metadata);
        let completionItemProvider = new ODataCompletionItemProvider(metadataService);
        context.subscriptions.push(vscode.languages.registerCompletionItemProvider(ODataMode,
            completionItemProvider, ...completionItemProvider.triggerCharacters));
    }

    if (configuration.format.enable) {
        let documentFormattingEditProvider = new ODataDocumentFormattingEditProvider(configuration.format);
        context.subscriptions.push(vscode.languages.registerDocumentFormattingEditProvider(ODataMode,
            documentFormattingEditProvider));
    }

    if (configuration.diagnostic.enable) {
        let diagnosticCollection = vscode.languages.createDiagnosticCollection('odata-diagnostics');
        let diagnosticsProvider = new ODataDiagnosticProvider(diagnosticCollection);
        vscode.workspace.onDidChangeTextDocument(diagnosticsProvider.onDidChangeTextDocument, null, context.subscriptions);
    }
}

// this method is called when your extension is deactivated
export function deactivate() {
}