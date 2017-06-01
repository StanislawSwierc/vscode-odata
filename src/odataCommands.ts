'use strict';

import * as vscode from 'vscode';

import {
    TextDocument, Position, Range, TextEditorEdit
} from 'vscode';

import { ODataMode } from './odataMode';

export function odataCombine() {
    let editor = vscode.window.activeTextEditor;
    let document = editor.document;

    if (document.languageId !== ODataMode.language) {
        vscode.window.showInformationMessage('This command affects only OData files.');
    } else {
        editor.edit(edit => odataCombineImpl(document, edit));
    }
}

function odataCombineImpl(document: vscode.TextDocument, edit: vscode.TextEditorEdit) {
    let text = document.getText();
    let range = new Range(new Position(0, 0), document.positionAt(text.length));
    let textCombined = text
        // Transform to lines.
        .split('\n')
        // Skip comments.
        .filter(t => !t.match(/^\s*\/\//))
        // Remove extra whitespaces and join into a single line.
        .map(t => t.trim())
        .join(' ')
        // Make sure there are no spaces in the fragment part or the URI.
        .replace(/\s+\?/, "?");
    edit.replace(range, textCombined);
}

export function odataDecode() {
    let editor = vscode.window.activeTextEditor;
    let document = editor.document;
    let text = document.getText();
    let range = new Range(new Position(0, 0), document.positionAt(text.length));

    try {
        // Use decodeURIComponent instead of decodeURI to allow users to split
        // queries into multiple lines.
        text = decodeURI(text.replace(/\+/g, "%20"));
        editor.edit(edit => edit.replace(range, text));
    } catch (exception) {
        vscode.window.showWarningMessage(`Query could not be decoded. ${exception.message}.`);
    }
}

export function odataEncode() {
    let editor = vscode.window.activeTextEditor;
    let document = editor.document;
    let text = document.getText();
    let range = new Range(new Position(0, 0), document.positionAt(text.length));

    text = encodeURI(text);

    editor.edit(edit => edit.replace(range, text));
}

export function odataEscape() {
    let editor = vscode.window.activeTextEditor;
    let document = editor.document;
    let text = document.getText();
    let range = new Range(new Position(0, 0), document.positionAt(text.length));

    text = text
        .replace(/\\/g, "\\\\")
        .replace(/\n/g, "\\n")
        .replace(/\"/g, '\\"')
        .replace(/\r/g, "\\r")
        .replace(/\t/g, "\\t");

    editor.edit(edit => edit.replace(range, text));
}

export function odataUnescape() {
    let editor = vscode.window.activeTextEditor;
    let document = editor.document;
    let text = document.getText();
    let range = new Range(new Position(0, 0), document.positionAt(text.length));

    text = text
        .replace(/\\n/g, "\n")
        .replace(/\\"/g, '\"')
        .replace(/\\r/g, "\r")
        .replace(/\\t/g, "\t")
        .replace(/\\\\/g, "\\");

    editor.edit(edit => edit.replace(range, text));
}