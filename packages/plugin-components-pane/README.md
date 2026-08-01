# @rchh/lowcode-plugin-components-pane

## Note

The current components pane is not compatible with the legacy assets package protocol. The supported assets protocol is as follows:

```TypeScript
export interface ComponentSort {
  groupList?: String[]; // Describes the tabs of the components pane and their order, e.g. ["Featured components", "Atomic components"]
  categoryList?: String[]; // Sections within a single tab of the components pane are separated by category; categories are ordered according to categoryList
}

export interface Assets {
  version: string; // Version of the assets package protocol
  packages?: Array<Package>; // Bundle list; "external" and "package" are similar concepts and are merged together here
  components: Array<ComponentDescription> | Array<RemoteComponentDescription>; // Description protocol list for all components
  componentList?: ComponentCategory[]; // [deprecated] Component category list used to describe the material pane
  sort: ComponentSort; // New field describing the tabs and categories of the components pane
}

export interface RemoteComponentDescription {
  exportName: string; // Export name of the component description; the description object can be read from window[exportName]
  url: string; // Resource URL of the component description
  package: { // npm information of the component (library)
	  npm: string;
  }
}
```
