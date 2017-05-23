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
Enable/disable default OData diagnostic.

* `odata.diagnostic.enable`: Enable/disable default OData diagnostic (requires restart)
* `odata.completion.enable`: Enable/disable default OData completion (requires restart)
* `odata.format.enable`: Enable/disable default OData formatter (requires restart)
* `odata.format.decode`: Enable/disable decoding as part of OData formatter (requires restart)
* `odata.format.syntax`: Enable/disable syntax-aware OData formatter (requires restart)
* `odata.metadata.map`: Associate OData metadata files in the current project"

## Release Notes
Currently this extension is in a very early stage..

### 0.0.1
Initial release to to exercise publish scripts.