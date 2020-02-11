import 'reflect-metadata';
import * as treeify from 'treeify';

/**
 * Шаг пятый. Вложенные Dto. Добавляем декоратор AccessControl
 * - обязателен для использования.
 * - поля к которым нет доступа из dto вырезаются.
 * В будущем можно будет сделать setValue по пути (аналогично getValue, но проще решить через computed);
 */

 type AccessControlEntry = {
  key: string | symbol,
  permissions: string[]
 }

type AccessControlTree = {
  entries: AccessControlEntry[],
  nested: AccessControlTree
};

const tokens = {
  ac: 'skeleton:access-control',
  type: 'design:type'
}

const newTree = () => ({ entries: [], nested: [] });

export const AccessControl = (permissions: string[]): PropertyDecorator => {

  return (target, key) => {
    const current: AccessControlTree = Reflect.getMetadata(tokens.ac, target) || newTree();
    current.entries.push({ key, permissions});
    Reflect.defineMetadata(tokens.ac, current, target);
  }
}

export const Nested = (): PropertyDecorator => {
  return (target, key) => {
    const ctor = Reflect.getMetadata(tokens.type, target, key);
    const ac = Reflect.getMetadata('skeleton:access-control', ctor.prototype);
    const current: AccessControlTree = Reflect.getMetadata(tokens.ac, target) || newTree();
    current.nested = ac;
    Reflect.defineMetadata(tokens.ac, current, target);
  }
}

export class UserDetailsDto {

  @AccessControl(['RESTRICTED'])
  fio: string;

  @AccessControl(['RESTRICTED'])
  age: number;

  @AccessControl(['RESTRICTED'])
  dob: Date;
}

export class UserDto {

  @AccessControl(['ALL', 'RESTRICTED'])
  id: number;

  @Nested()
  @AccessControl(['RESTRICTED'])
  details: UserDetailsDto;
}

export class UserEntity {
  id: number;
  details: {
    name: string;
    surname: string;
    dob: Date;
  }
}

export type Computed = (exts: any) => any;

export type Options = {
  paths?: { [ name: string ]: string },
  computed?: { [ name: string ]: Computed }
}

export type Constructor<T> = new () => T;

const keyExists = (ac: AccessControlTree, key: string): boolean => {
  return !!ac.entries.find(item => item.key === key);
}

const getValue = (obj: any, path: string): any => {
  const arr = path.split('.');
  return arr.reduce((acc, key) => {
    return acc[key];
  }, obj);
}

// Шаг первый. Нужно получить из Entity UserDto

const intersect = (arr1: any[], arr2: any[]) => {
  return arr1.filter(i => arr2.includes(i))
}
const hasIntersections = (arr1: any[], arr2: any[]) => {
  return intersect(arr1, arr2).length > 0;
}

function extractOne<TDto, TEntity>(dto: Constructor<TDto>, entity: TEntity, permissions: string[], options: Options) {

  const ac = (Reflect.getMetadata('skeleton:access-control', dto.prototype) as AccessControlTree);
  console.log(treeify.asTree(ac as any, true, true));
  ac.entries = ac.entries.filter(item => hasIntersections(item.permissions, permissions));
  console.log(treeify.asTree(ac as any, true, true));
  
  const result = new dto();

  // const exts = Object.keys(options.paths).reduce((acc, key) => {
  //     const value = getValue(entity, options.paths[key]);
  //     if (keyExists(ac, key)) {
  //       result[key] = value;
  //     }
  //     acc[key] = value;
  //     return acc;
  //   },
  //   { });

  // Object.keys(options.computed)
  //   .filter(key => keyExists(ac, key))
  //   .forEach(key => {
  //     result[key] = options.computed[key](exts);
  //   });
  return result;
}

const entity = new UserEntity();
entity.id = 1;
entity.details = {
  dob: new Date('1986-03-26'),
  name: 'Anton',
  surname: 'Antonov'
}

const permissions = ['RESTRICTED'];

const result = extractOne(UserDto, entity, permissions, {
  paths: {
    id: 'id'
  },
  computed: {
    // Вынести в nested и улучшить сигнатуру функциию.
    // Permissions убрать в класс
    details: (exts: any) => extractOne(UserDetailsDto, entity, permissions, {
      paths: {
        dob: 'details.dob',
        name: 'details.name',
        surname: 'details.surname'
      },
      computed: {
        fio: exts => exts.name + ' ' + exts.surname,
        age: exts => new Date().getFullYear() - exts.dob.getFullYear()
      }
    })
  }
});

console.log(result);
