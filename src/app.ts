import 'reflect-metadata';

export const AccessLevel = (lvl: number): PropertyDecorator => {
  return (target, key) => {
    const current = Reflect.getMetadata('skeleton:access-control', target) || [];
    current.push({ key, lvl });
    Reflect.defineMetadata('skeleton:access-control', current, target);
  }
}

export const AccessControl = (target: Function) => {
  const ac = Reflect.getMetadata('skeleton:access-control', target.prototype);

  console.log(ac);
  target.prototype.accessControl = function (lvl: number) {
    ac.filter(x => x.lvl > lvl).forEach(x => {
      delete this[x.key];
    });
    return this;
  }
}

@AccessControl
export class User {

  @AccessLevel()
  name: string;

  @AccessLevel(Enum.Extended, Enum.Detailed);
  surname: string;

  @AccessLevel(1)
  age: number;

  @AccessLevel(2)
  profession: string;
}

export class UserDto {

  @AccessControl('MED_LIST_EXTENDED')
  fio: string;
  age: number;
  profession: string;
}

const user = new User();
user.name = 'Sergey';
user.surname = 'Aslanov';
user.age = 17;
user.profession = 'programmer';

const stripped = (user as any).accessControl(0);
console.log(stripped);
console.log(stripped instanceof User);
console.log();




function action(
  @Access() lvl
): User {

  service(lvl)

  const user = new User();
  user.name = 'Sergey';
  user.surname = 'Aslanov';
  user.age = 17;
  user.profession = 'programmer';

  return user;
}

function strip(user: User) {

}