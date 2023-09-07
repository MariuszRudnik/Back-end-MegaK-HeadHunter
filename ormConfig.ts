export const databaseConfig = {
    type: "mysql",
    host: "localhost",
    port: 8889,
    username: "root",
    password: "root",
    database: 'head_hunt',
    entities: ['dist/**/**.entity{.ts,.js}'],
    bigNumberStrings: false,
    logging: false,
    synchronize: true,
    migrations: ['dist/migration/*.js'],
}