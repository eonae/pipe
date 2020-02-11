import 'reflect-metadata';
import { createConnection, Connection, Repository } from 'typeorm';
import UserEntity from './iter-6/user.entity';
import UserDetailsEntity from './iter-6/user-details.entity';
import { User } from './app';

/**
* Добавляем реальную entity
 */

type DtoAccessControl = Array<{
  key: string | symbol,
  permissions: string[]
}>;


export type Computed = (exts: any) => any;

export type Options = {
  paths: { [ name: string ]: string },
  computed: { [ name: string ]: Computed }
}

export type Constructor<T> = new () => T;

const keyExists = (ac: DtoAccessControl, key: string): boolean => !!ac.find(item => item.key === key);

const getValue = (obj: any, path: string): any => {
  const arr = path.split('.');
  return arr.reduce((acc, key) => {
    return acc[key];
  }, obj);
}

export const AccessControl = (permissions: string[]): PropertyDecorator => {
  return (target, key) => {
    const current: DtoAccessControl = Reflect.getMetadata('skeleton:access-control', target) || [];
    current.push({ key, permissions });
    Reflect.defineMetadata('skeleton:access-control', current, target);
  }
}

export const Nested = (): PropertyDecorator => {
  return (target, key) => {
    const ctor = Reflect.getMetadata('design:type', target, key);
    const ac = Reflect.getMetadata('skeleton:access-control', ctor.prototype);
    console.log(ac);
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

async function drop(connection: Connection) {
  return connection.query(`
    DELETE FROM user_details_entity;
    DELETE FROM user_entity;
  `);
}

async function seed(connection: Connection) {
  const user = new UserEntity();
  const details = new UserDetailsEntity();
  details.name = 'Sergey';
  details.surname = 'Aslanov';
  details.user = user;
  user.details = [ details ];
  
  await connection.manager.save(user);
  await connection.manager.save(details);
}

async function main() {

  const connection = await createConnection('test');

  const userRepo = connection.getRepository(UserEntity);

  const countUser = await userRepo.count();

  if (countUser > 0) await drop(connection);
  await seed(connection);

  const include = true;

  const baseAlias = 'a';

  const user = await userRepo.createQueryBuilder(baseAlias)
    .leftJoin('a.details', 'details')
    .select([ 'a.id', 'details.name', 'details.name', 'details.surname' ])
    .getOne();
  
  console.log(user);
  
  await connection.close();
}

main();


async function extractOne<TDto, TEntity>(
  dto: Constructor<TDto>,
  repo: Repository<TEntity>,
  permissions: string[],
  options: Options) {

  const ac = (Reflect.getMetadata('skeleton:access-control', dto.prototype) as DtoAccessControl)
    .filter(item => item.permissions.filter(p => permissions.includes(p)).length > 0)

  const result = new dto();

  const joins: string[] = [];


  const root = 'a';

  const user = await repo.createQueryBuilder(root)
    .leftJoin(root + '.details', 'details')
    .select([
      root + '.id',
      'details.name',
      'details.name',
      'details.surname'
    ])
    .getOne();
  
  console.log(user);

  // const exts = Object.keys(options.paths)
  //   .reduce((acc, key) => {
  //     const value = getValue(entity, options.paths[key]);
  //     if (keyExists(ac, key)) {
  //       result[key] = value;
  //     }
  //     acc[key] = value;
  //     return acc;
  //   }, { });

  // Object.keys(options.computed)
  //   .filter(key => keyExists(ac, key))
  //   .forEach(key => {
  //     result[key] = options.computed[key](exts);
  //   });
  return result;
}

// const result = extractOne(UserDto, UserEntity, ['RESTRICTED'], {
//   paths: {
//     id: 'id',
//     name: 'details.name',
//     surname: 'details.surname',
//     dob: 'details.dob'
//   },
//   computed: {
//     details: (exts: any) => ({
//       fio: exts.name + ' ' + exts.surname,
//       age: new Date().getFullYear() - exts.dob.getFullYear(),
//       dob: exts.dob
//     })
//   }
// });

// console.log(result);
