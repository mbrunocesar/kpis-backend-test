import { TypeOrmModuleAsyncOptions } from '@nestjs/typeorm';
import { User } from "../../modules/users/entities/user.entity";
import { UserRelationship } from "../../modules/users/entities/user-relationship.entity";

export const DATABASE_CONFIGS = <TypeOrmModuleAsyncOptions>{
  useFactory: async () => {
    let dbConnectionInfo;

    const entitiesList = [
      User,
      UserRelationship
    ];

    if (process.env.NODE_ENV === 'test') {
       dbConnectionInfo = {
        type: 'mysql',
        host: process.env.DB_TEST_HOSTNAME,
        port: parseInt(process.env.DB_TEST_PORT),
        username: process.env.DB_TEST_USERNAME,
        password: process.env.DB_TEST_PASSWORD,
        database: process.env.DB_TEST_DATABASE,
        entities: entitiesList,
        synchronize: true,
        dropSchema: true,
      };
    } else {
      dbConnectionInfo = {
        type: 'mysql',
        host: process.env.DB_HOSTNAME,
        port: parseInt(process.env.DB_PORT),
        username: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_DATABASE,
        entities: entitiesList,
      };
    }

    return dbConnectionInfo;
  },
};
