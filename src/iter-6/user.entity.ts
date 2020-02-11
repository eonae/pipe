import { Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import UserDetailsEntity from './user-details.entity';

@Entity({ synchronize: true })
export default class UserEntity {

  @PrimaryGeneratedColumn()
  id: number;
  
  @OneToMany(type => UserDetailsEntity, details => details.user)
  details: UserDetailsEntity[]
}