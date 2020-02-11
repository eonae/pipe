import 'reflect-metadata';
import { Entity, getConnection, Column, OneToMany, ManyToOne, JoinColumn, Entity } from 'typeorm';

/**
* Добавляем реальную entity
 */

type DtoAccessControl = Array<{
  key: string | symbol,
  permissions: string[]
}>;

export const AccessControl = (permissions: string[]): PropertyDecorator => {
  return (target, key) => {
    const current: DtoAccessControl = Reflect.getMetadata('skeleton:access-control', target) || [];
    current.push({ key, permissions});
    Reflect.defineMetadata('skeleton:access-control', current, target);
  }
}

export class UserDto {

  @AccessControl(['ALL', 'RESTRICTED'])
  id: number;

  @AccessControl(['RESTRICTED'])
  details: {
    fio: string;
    age: number;
    dob: Date;
  }
}

@Entity({ synchronize: true })
export class UserEntity {
  @Column()
  id: number;
  
  @OneToMany(type => UserDetailsEntity, details => details.user)
  details: UserDetailsEntity[]
}

@Entity({ synchronize: true })
export class UserDetailsEntity {
  @Column() name: string;
  @Column() surname: string;
  @ManyToOne(type => UserEntity, user => user.details)
  @JoinColumn()
  user: UserEntity
}

async function main() {
  const userRepo = getConnection().getRepository(UserEntity);
  const detailsRepo = getConnection().getRepository(UserDetailsEntity);
  const countUsr = await userRepo.count();
  const countDet = await userRepo.count();
  console.log(countUsr, countDet);
}

main();



// export type Computed = (exts: any) => any;

// export type Options = {
//   paths: { [ name: string ]: string },
//   computed: { [ name: string ]: Computed }
// }

// export type Constructor<T> = new () => T;

// const keyExists = (ac: DtoAccessControl, key: string): boolean => !!ac.find(item => item.key === key);

// const getValue = (obj: any, path: string): any => {
//   const arr = path.split('.');
//   return arr.reduce((acc, key) => {
//     return acc[key];
//   }, obj);
// }

// // Шаг первый. Нужно получить из Entity UserDto

// function extractOne<TDto, TEntity>(dto: Constructor<TDto>, entity: TEntity, permissions: string[], options: Options) {

//   const ac = (Reflect.getMetadata('skeleton:access-control', dto.prototype) as DtoAccessControl)
//     .filter(item => item.permissions.filter(p => permissions.includes(p)).length > 0)

//   const result = new dto();

//   const exts = Object.keys(options.paths)
//     .reduce((acc, key) => {
//       const value = getValue(entity, options.paths[key]);
//       if (keyExists(ac, key)) {
//         result[key] = value;
//       }
//       acc[key] = value;
//       return acc;
//     }, { });

//   Object.keys(options.computed)
//     .filter(key => keyExists(ac, key))
//     .forEach(key => {
//       result[key] = options.computed[key](exts);
//     });
//   return result;
// }

// const entity = new UserEntity();
// entity.id = 1;
// entity.details = {
//   dob: new Date('1986-03-26'),
//   name: 'Anton',
//   surname: 'Antonov'
// }

// const result = extractOne(UserDto, entity, ['RESTRICTED'], {
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
