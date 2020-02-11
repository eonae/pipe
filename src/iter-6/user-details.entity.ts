import { Entity, Column, ManyToOne, JoinColumn, PrimaryGeneratedColumn, Index } from 'typeorm';
import UserEntity from './user.entity';

@Entity({ synchronize: true })
export default class UserDetailsEntity {

  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  surname: string;

  @ManyToOne(type => UserEntity, user => user.details)
  @JoinColumn()
  user: UserEntity
}