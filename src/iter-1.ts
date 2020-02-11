/**
 * Шаг первый. Нужно получить из Entity UserDto.
 */

export class UserDto {
  id: number = 0;
  fio: string = '';
  age: number = 0;
}

export class UserEntity {
  id: number;
  name: string;
  surname: string;
  dob: Date;
}

export type Computed = (exts: any) => any;

export type Options = {
  paths: { [ name: string ]: string },
  computed: { [ name: string]: Computed }
}

export type Constructor<T> = new () => T;

// Нужно условие базирующееся на декораторах, чтобы не нужно было инициализировать.
const keyExists = (obj: any, key: string): boolean => obj[key] !== undefined;




function extractOne<TDto, TEntity>(dto: Constructor<TDto>, entity: TEntity, options: Options) {
  const result = new dto();
  // Необходима инициализация или через декораторы.

  const exts = Object.keys(options.paths)
    .reduce((acc, key) => {
      const value = entity[options.paths[key]];
      if (keyExists(result, key)) {
        result[key] = value;
      }
      acc[key] = value;
      return acc;
    }, { });

  Object.keys(options.computed)
    .filter(key => keyExists(result, key))
    .forEach(key => {
      result[key] = options.computed[key](exts);
    });
  return result;
}

const entity = new UserEntity();
entity.dob = new Date('1986-03-26');
entity.id = 1;
entity.name = 'Anton';
entity.surname = 'Antonov';

const result = extractOne(UserDto, entity, {
  paths: {
    id: 'id',
    name: 'name',
    surname: 'surname',
    dob: 'dob'
  },
  computed: {
    fio: (exts: any) => exts.name + ' ' + exts.surname,
    age: (exts: any) => new Date().getFullYear() - exts.dob.getFullYear()
  }
});

console.log(result);
