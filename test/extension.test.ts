import * as path from 'path';
import * as fs from 'fs-promise';
import * as vscode from 'vscode';
import { expect, assert } from "chai";

import * as extension from '../src/extension';
import * as odataMetadata from '../src/odataMetadata';

suite("Metadata Tests", () => {

    // TODO: Find clean way to pass workspace path.
    let rootPath = "c:\\Sources\\vscode-odata"; //process.env['GOPATH'];
    let fixturesPath = path.join(rootPath, "test", "fixtures");

    test("Can parse", (done) => {
        fs.readFile(path.join(fixturesPath, "metadata.xml"), { encoding: "utf8" })
            .then(content => {
                let parser = new odataMetadata.ODataMetadataParser();
                let metadata = parser.parse(content);

                expect(metadata.schemas.length).equals(3, "Number of schemas does not match.");
            }).then(() => done(), done);
    });
});