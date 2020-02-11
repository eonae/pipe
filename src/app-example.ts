// be sure to import reflect-metadata
// without importing reflect-metadata Reflect.defineMetadata and other will not be defined.
import "reflect-metadata";

function First(target: Object, propertyKey: string | symbol) {
  // define metadata with value "First"
  Reflect.defineMetadata("custom:anotations:first", "First", target, propertyKey);
}

function Second(target: Object, propertyKey: string | symbol) {
  // define metadata with value { second: 2 }
  // be sure that metadata key is different from First
  Reflect.defineMetadata("custom:anotations:second", { second: 2 }, target, propertyKey);
}

class Test {
  @First
  @Second
  someAttribute: string;
}

// get decorators

function getDecorators(target: any, propertyName: string | symbol): string[] {
  // get info about keys that used in current property
  const keys: any[] = Reflect.getMetadataKeys(target, propertyName);
  const decorators = keys
    // filter your custom decorators
    .filter(key => key.toString().startsWith("custom:anotations"))
    .reduce((values, key) => {
      // get metadata value.
      const currValues = Reflect.getMetadata(key, target, propertyName);
      return values.concat(currValues);
    }, []);

  return decorators;
}

// test

var t = new Test();
var decorators = getDecorators(t, "someAttribute"); // output is [{ second: 2}, "First"]
console.log(decorators);