import { XmlDocument, XmlElement } from 'xmldoc';
import * as Syntax from './odataSyntax'
import * as fs from 'fs-promise';

export interface ODataMetadataConfiguration {
    map: Array<{ url: string, path: string }>;
}

export interface IODataMetadataService {
    getMetadataForDocument(uri: string, tree: Syntax.SyntaxTree): Thenable<IMetadata>;
}

export interface IEntityType {
    name: string;
    key?: IPropertyRef[];
    properties?: IProperty[];
}

export interface IPropertyRef {
    name: string;
}

export interface IProperty {
    name: string;
    type: string;
    nullable?: boolean;
    annotations?: IAnnotation[];
}

export interface INavigationProperty {
    name: string;
    type: string;
    referentialConstraints?: IReferentialConstraint[];
}

export interface IReferentialConstraint {
    property: string;
    referencedProperty: string;
}

export interface IEntityContainer {
    name: string;
    entitySets?: IEntitySet[];
}

export interface IEntitySet {
    name: string;
    entityType: string;
    navigationPropertyBindings?: INavigationPropertyBinding[];
    annotations?: IAnnotation[];
}

export interface INavigationPropertyBinding {
    path: string;
    target: string;
}

export interface IAnnotation {
    term: string;
    value: any;
}

export interface ISchema {
    namespace: string;
    entityTypes?: IEntityType[];
    entityContainers?: IEntityContainer[];
}

export interface IMetadata {
    schemas?: ISchema[];
}

export class ODataMetadataParser {

    parse(text: string): IMetadata {
        return this.parseDocument(new XmlDocument(text));
    }

    parseDocument(document: XmlDocument): IMetadata {
        let dataServices = document.childNamed("edmx:DataServices");
        return <IMetadata>{
            schemas: this.parseCollection(dataServices, "Schema", (e) => this.parseSchema(e))
        };
    }

    parseSchema(element: XmlElement): ISchema {
        return <ISchema>{
            namespace: element.valueWithPath("Namespace"),
            entityTypes: this.parseCollection<IEntityType>(element, "EntityType", (e) => this.parseEntityType(e)),
            entityContainers: this.parseCollection<IEntityContainer>(element, "EntityContainer", (e) => this.parseEntityContainer(e))
        }
    }

    parseEntityContainer(element: XmlElement): IEntityContainer {
        return <IEntityContainer>{
            name: element.valueWithPath("Name"),
            entitySets: this.parseCollection<IEntitySet>(element, "EntitySet", (e) => this.parseEntitySet(e))
        }
    }

    parseEntitySet(element: XmlElement): IEntitySet {
        return <IEntitySet>{
            name: element.valueWithPath("Name"),
            entityType: element.valueWithPath("EntityType"),
            navigationPropertyBindings: this.parseCollection<INavigationPropertyBinding>(element, "NavigationPropertyBinding", (e) => this.parseNavigationPropertyBinding(e)),
            annotations: this.parseCollection(element, "Annotation", (e) => this.parseAnnotation(e))
        }
    }

    parseNavigationPropertyBinding(element: XmlElement): INavigationPropertyBinding {
        return <INavigationPropertyBinding>{
            path: element.valueWithPath("Path"),
            target: element.valueWithPath("Target")
        }
    }

    parseEntityType(element: XmlElement): IEntityType {
        return <IEntityType>{
            name: element.valueWithPath("Name"),
            properties: this.parseCollection<IProperty>(element, "Property", (e) => this.parseProperty(e))
        }
    }

    parseProperty(element: XmlElement): IProperty {
        let a = 10;
        return <IProperty>{
            name: (<any>element).attr["Name"],
            type: element.valueWithPath("Type"),
            nullable: element.valueWithPath("Nullable") ? !!element.valueWithPath("Nullable") : undefined,
            annotations: this.parseCollection(element, "Annotation", (e) => this.parseAnnotation(e))
        };
    }

    parseAnnotation(element: XmlElement): IAnnotation {
        // TODO: support different types of annotations
        return <IAnnotation>{
            term: element.valueWithPath("Term"),
            value: element.valueWithPath("String")
        }
    }

    parseCollection<T>(element: XmlElement, name: string, select: (element: XmlElement) => T) {
        let nodes = element.childrenNamed(name);
        let result = new Array<T>();

        for (let i = 0; i < nodes.length; i++) {
            result.push(select(nodes[i]));
        }

        return result.length > 0 ? result : undefined;
    }
}

export function createPropertyMap(metadata: IMetadata): { [id: string]: IProperty; } {
    return metadata.schemas
        .reduce<IEntityType[]>(
        (acc, schema) => { return <IEntityType[]>(schema.entityTypes ? acc.concat(schema.entityTypes) : acc); },
        new Array<IEntityType>()
        )
        .filter((entityType) => {
            return entityType.name === "WorkItem" || entityType.name === "CustomWorkItem";
        })
        .reduce<IProperty[]>(
        (acc, x) => { return <IProperty[]>(x.properties ? acc.concat(x.properties) : acc); },
        new Array<IProperty>()
        )
        .map((p) => {
            let referenceName = p.annotations
                ? p.annotations
                    .filter((a) => { return a.term === "Ref.ReferenceName" })
                    .map((a) => { return a.value as string; })[0]
                : undefined;

            return { referenceName: referenceName, property: p };
        })
        .filter((x) => {
            return x.referenceName !== undefined;
        })
        .reduce<{ [id: string]: IProperty; }>(
        (acc, x) => { acc[x.referenceName] = x.property; return acc; },
        {}
        );
}

export class LocalODataMetadataService implements IODataMetadataService {
    configuration: ODataMetadataConfiguration;
    cache: { [key: string]: Thenable<IMetadata>; } = {};

    constructor(configuraiton: ODataMetadataConfiguration) {
        this.configuration = configuraiton;
    }

    getMetadataForDocument(uri: string, tree: Syntax.SyntaxTree): Thenable<IMetadata> {
        let serviceRoot = tree.root.serviceRoot.toLowerCase();
        let mapEntry = this.configuration.map.find(_ => serviceRoot.startsWith(_.url.toLocaleLowerCase()));
        if (mapEntry) {
            if (this.cache[mapEntry.path] === undefined) {
                this.cache[mapEntry.path] = fs.readFile(mapEntry.path, { encoding: "utf8" })
                    .then(text => {
                        let parser = new ODataMetadataParser();
                        return parser.parse(text);
                    });
            }
            return this.cache[mapEntry.path];
        } else {
            return Promise.reject(`There is no entry registered in the 'odata.metadata.map' for uri '${serviceRoot}'`);
        }
    }
}