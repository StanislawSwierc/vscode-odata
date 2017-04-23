
import {
    DocumentFormattingEditProvider,
    TextDocument,
    FormattingOptions,
    CancellationToken,
    ProviderResult,
    TextEdit,
    Position,
    Range
} from 'vscode'
import * as syntax from "./odataSyntax";

interface ODataFormattingOptions extends FormattingOptions {
    lineSize: number;
    newLine: string;
    indent: string;
}

class FormattingSyntaxVisitor extends syntax.SyntaxVisitor<string> {
    options: ODataFormattingOptions;
    text: string;
    currentIndent: string;

    constructor(options: ODataFormattingOptions) {
        super();
        this.options = options;
        this.text = "";
    }

    visitError(node: syntax.ErrorSyntax): string {
        return this.visitDefault(node);
    }

    visitSelect(node: syntax.SelectSyntax): string {
        let children = node.children.map(n => this.visit(n));
        let oneline = "$select=" + children.join(", ");
        let multilineIndent = `${this.options.newLine}${this.options.indent}${this.options.indent}`;
        let multiline = `$select=${multilineIndent}` + children.join(`,${multilineIndent}`);
        return oneline.length <= this.options.lineSize ? oneline : multiline;
    }

    visitPrimitiveProperty(node: syntax.SelectProprty): string {
        return node.propertyName;
    }

    visitUri(node: syntax.UriSyntax): string {
        return node.serviceRoot + "\r\n    ?" + this.visit(node.select);
    }
}

export class ODataDocumentFormattingEditProvider implements DocumentFormattingEditProvider {
    provideDocumentFormattingEdits(document: TextDocument, options: FormattingOptions, token: CancellationToken): ProviderResult<TextEdit[]> {
        options.lineSize = 100;
        options.newLine = "\r\n"
        options.indent = "    ";

        try {
            let text = document.getText();
            let range = new Range(new Position(0, 0), document.positionAt(text.length));
            let tree = syntax.Parser.parse(text);
            let visitor = new FormattingSyntaxVisitor(options as ODataFormattingOptions);
            let formattedText = visitor.visit(tree.root);
            return [TextEdit.replace(range, formattedText)];
        } catch (error) {
            console.error(`Formatting could not be performed due to an error: ${error}`);
            return [];
        }       
    }
}