/**
 * Шаг третий. Назначаем вложенные поля.
 * 
 * В будущем можно будет сделать setValue по пути (аналогично getValue, но проще решить через computed);
 */

export class UserDto {
  id: number = 0;
  details: {
    fio: string;
    age: number;
    dob: Date;
  } = { fio: '', age: 0, dob: new Date() } // Это не будет нужно с декораторами.
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
  paths: { [ name: string ]: string },
  computed: { [ name: string]: Computed }
}

export type Constructor<T> = new () => T;

// Нужно условие базирующееся на декораторах, чтобы не нужно было инициализировать.
const keyExists = (obj: any, key: string): boolean => obj[key] !== undefined;
// const getValue = (obj: any, path: string): any => path.split('.').reduce((acc, key) => obj[key], obj);

const getValue = (obj: any, path: string): any => {
  const arr = path.split('.');
  // console.log(arr);
  const value = arr.reduce((acc, key) => {
    // console.log('obj', obj);
    // console.log('key', key);
    // console.log('value', obj[key]);
    return acc[key];
  }, obj);
  return value;
}

// Шаг первый. Нужно получить из Entity UserDto

function extractOne<TDto, TEntity>(dto: Constructor<TDto>, entity: TEntity, options: Options) {
  const result = new dto();
  // Необходима инициализация или через декораторы.

  const exts = Object.keys(options.paths)
    .reduce((acc, key) => {
      const value = getValue(entity, options.paths[key]);
      if (keyExists(result, key)) {
        result[key] = value;
      }
      acc[key] = value;
      return acc;
    }, { });

  // console.log('exts:', exts);

  Object.keys(options.computed)
    .filter(key => keyExists(result, key))
    .forEach(key => {
      result[key] = options.computed[key](exts);
    });
  return result;
}

const entity = new UserEntity();
entity.id = 1;
entity.details = {
  dob: new Date('1986-03-26'),
  name: 'Anton',
  surname: 'Antonov'
}

const result = extractOne(UserDto, entity, {
  paths: {
    id: 'id',
    name: 'details.name',
    surname: 'details.surname',
    dob: 'details.dob'
  },
  computed: {
    details: (exts: any) => ({
      fio: exts.name + ' ' + exts.surname,
      age: new Date().getFullYear() - exts.dob.getFullYear(),
      dob: exts.dob
    })
  }
});

console.log(result);
