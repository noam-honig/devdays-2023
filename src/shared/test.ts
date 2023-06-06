import { Entity, Fields, SqlDatabase } from 'remult'

@Entity('people', {
  allowApiCrud: true,
})
export class Person {
  @Fields.cuid()
  id = ''
  @Fields.string()
  name = ''
  @Fields.string()
  discr = ''
}

@Entity<Person>('employees', {
  allowApiCrud: true,
  dbName: 'people',
  backendPrefilter: {
    discr: 'person',
  },
  saving: (self) => {
    self.discr = 'person'
  },
})
export class Employee extends Person {}
