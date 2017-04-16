import { XmlDocument, XmlElement } from 'xmldoc';

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
    parseDocument(document: XmlDocument): IMetadata {
        let edmx = document.childNamed("edmx:Edmx")[0];
        return <IMetadata>{
            schemas: this.parseCollection(edmx, "Schema", (e) => this.parseSchema(e))
        };
    }

    parseSchema(element: Element): ISchema {
        return <ISchema>{
            namespace: element.getAttribute("Namespace"),
            entityTypes: this.parseCollection<IEntityType>(element, "EntityType", (e) => this.parseEntityType(e)),
            entityContainers: this.parseCollection<IEntityContainer>(element, "EntityContainer", (e) => this.parseEntityContainer(e))
        }
    }

    parseEntityContainer(element: Element): IEntityContainer {
        return <IEntityContainer>{
            name: element.getAttribute("Name"),
            entitySets: this.parseCollection<IEntitySet>(element, "EntitySet", (e) => this.parseEntitySet(e))
        }
    }

    parseEntitySet(element: Element): IEntitySet {
        return <IEntitySet>{
            name: element.getAttribute("Name"),
            entityType: element.getAttribute("EntityType"),
            navigationPropertyBindings: this.parseCollection<INavigationPropertyBinding>(element, "NavigationPropertyBinding", (e) => this.parseNavigationPropertyBinding(e)),
            annotations: this.parseCollection(element, "Annotation", (e) => this.parseAnnotation(e))
        }
    }

    parseNavigationPropertyBinding(element: Element): INavigationPropertyBinding {
        return <INavigationPropertyBinding>{
            path: element.getAttribute("Path"),
            target: element.getAttribute("Target")
        }
    }

    parseEntityType(element: Element): IEntityType {
        return <IEntityType>{
            name: element.getAttribute("Name"),
            properties: this.parseCollection<IProperty>(element, "Property", (e) => this.parseProperty(e))
        }
    }

    parseProperty(element: Element): IProperty {
        return <IProperty>{
            name: element.getAttribute("Name"),
            type: element.getAttribute("Type"),
            nullable: element.hasAttribute("Nullable") ? !!element.getAttribute("Nullable") : undefined,
            annotations: this.parseCollection(element, "Annotation", (e) => this.parseAnnotation(e))
        };
    }

    parseAnnotation(element: Element): IAnnotation {
        // TODO: support different types of annotations
        return <IAnnotation>{
            term: element.getAttribute("Term"),
            value: element.getAttribute("String")
        }
    }

    parseCollection<T>(element: Element, name: string, select: (element: Element) => T) {
        let nodes = element.getElementsByTagName(name);
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