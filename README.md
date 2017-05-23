# OData for Visual Studio Code
This extension adds rich language support for the [OData](http://www.odata.org/) query language.

## Features
In the first release this extension adds the capabilities listed below.
Only capabilities are enabled by default, whereas others can be turned on in the settings.

* syntax highlighting (enabled)
* query encoding/decoding (enabled)
* syntax-aware formatting (disabled)
* metadata-driven code completion (disabled)
* diagnostics (disabled)

## Commands

#### OData Combine
Combines multiline query into a one-line URL.

![odata-combine](https://raw.githubusercontent.com/StanislawSwierc/vscode-odata/master/images/odata-combine.gif)

#### OData Encode URI
Encodes URI and replaces unsafe ASCII characters with a "%" followed by two hexadecimal digits. 

![odata-combine](https://raw.githubusercontent.com/StanislawSwierc/vscode-odata/master/images/odata-encode.gif)

#### OData Decode URI
Decodes URI. This command is really helpful when you copy query from a browser or log files that store all URIs in the encoded form.

![odata-combine](https://raw.githubusercontent.com/StanislawSwierc/vscode-odata/master/images/odata-encode.gif)


## Settings

### Quick example settings

Below is an example of a [settings.json](https://code.visualstudio.com/Docs/customization/userandworkspace) file for VSCode settings applicable to this extension. 
Continue to the next section for more in-depth documentation. 
This example enables `completion` feature and specifies where to find the metadata for queries which target `https://stansw.analytics.visualstudio.com/vscode-odata/_odata` endpoint.

```json
{
    "odata.completion.enable": true,
    
    "odata.diagnostic.enable": false,

    "odata.format.enable": true,
    "odata.format.syntax": false,
    "odata.format.decode": true,
    
    "odata.metadata.map": [
        { 
            "url": "https://stansw.analytics.visualstudio.com/vscode-odata/_odata", 
            "path": "C:/Sources/vscode-odata/test/fixtures/metadata.xml"
        }
    ]
}
```

### Settings details
This extension can be controlled with the following settings:

#### `odata.diagnostic.enable` (requires restart)
Enable/disable default diagnostics.

#### `odata.completion.enable` (requires restart)
Enable/disable completion. Currently completion is driven by the metadata. 
If you set the `odata.metadata.map` setting correctly (see below) then editor will suggest names of the properties and entities.
Please notice that currently these suggestions are not context-sensitive and all property names are used regardless the entity you are working with.
This will be improved in the future releases.

#### `odata.format.enable` (requires restart)
Enable/disable formatter (`Alt+Shift+F`).

#### `odata.format.decode` (requires restart)
Enable/disable URI decoding as part of formatting.
This can be helpful if you copy encoded URL(s) from browser or log files. 

### `odata.format.syntax` (requires restart)
Enable/disable syntax-aware formatting.

#### `odata.metadata.map` (requires restart)
Associate metadata files in the current project.
This setting consists of a list of mapping definition where user can specify url and the path to the offline metadata.
You can get this file by opening up `$metadata` endpoint and saving it locally.
Example below was created by downloading `https://stansw.analytics.visualstudio.com/vscode-odata/_odata/$metadata` file.

 ```json
{
    "odata.metadata.map": [
        { 
            "url": "https://stansw.analytics.visualstudio.com/vscode-odata/_odata", 
            "path": "C:/Sources/vscode-odata/test/fixtures/metadata.xml"
        }
    ]
}
```

Once mapping is defined, extension will try to find the right metadata by looking for the first url that matches the beginning of the query.
For the example query below extension would use metadata file at `C:/Sources/vscode-odata/test/fixtures/metadata.xml` because its mapping url `https://stansw.analytics.visualstudio.com/vscode-odata/_odata` matches the beginning of the query.
```
https://stansw.analytics.visualstudio.com/vscode-odata/_odata/WorkItems?$select...
```

## Release Notes
Currently this extension is in a very early stage.

### 0.0.4 (2017-05-23)
Improved formatting and new commands added.

### 0.0.3 (2017-04-25)
Defined settings model to control stable and experimental features.

### 0.0.1 (2017-04-23)
Initial release to to exercise publish scripts.