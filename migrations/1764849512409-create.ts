import { MigrationInterface, QueryRunner } from "typeorm";

export class Create1764849512409 implements MigrationInterface {
    name = 'Create1764849512409'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`spends\` (\`id\` int NOT NULL AUTO_INCREMENT, \`salary\` decimal(10,2) NOT NULL, \`expenses\` decimal(10,2) NOT NULL, \`saving\` decimal(10,2) NOT NULL, \`user_id\` int NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`comments\` (\`id\` int NOT NULL AUTO_INCREMENT, \`content\` varchar(255) NOT NULL, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`authorId\` int NULL, \`announcementId\` int NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`reaction\` (\`id\` int NOT NULL AUTO_INCREMENT, \`type\` varchar(32) NOT NULL, \`userId\` int NULL, \`announcementId\` int NULL, UNIQUE INDEX \`IDX_163c1af1ae33bd15ef6a9ad943\` (\`userId\`, \`announcementId\`, \`type\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`announcements\` (\`id\` int NOT NULL AUTO_INCREMENT, \`title\` varchar(255) NOT NULL, \`content\` text NOT NULL, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`authorId\` int NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`users\` (\`id\` int NOT NULL AUTO_INCREMENT, \`name\` varchar(255) NOT NULL, \`email\` varchar(255) NOT NULL, \`password\` varchar(255) NOT NULL, \`gender\` varchar(255) NOT NULL, \`blood_group\` varchar(255) NOT NULL, \`religion\` varchar(255) NOT NULL, \`age\` int NOT NULL, \`role\` varchar(255) NOT NULL, \`pinned\` tinyint NOT NULL DEFAULT 0, \`twoFactorSecret\` varchar(255) NULL, \`flag\` tinyint NOT NULL DEFAULT 0, \`trustedDevices\` json NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`spends\` ADD CONSTRAINT \`FK_6518db631ca878f98cc354603fc\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`comments\` ADD CONSTRAINT \`FK_4548cc4a409b8651ec75f70e280\` FOREIGN KEY (\`authorId\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`comments\` ADD CONSTRAINT \`FK_2bf4aa41d384038daf10e39a8e8\` FOREIGN KEY (\`announcementId\`) REFERENCES \`announcements\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`reaction\` ADD CONSTRAINT \`FK_e58a09ab17e3ce4c47a1a330ae1\` FOREIGN KEY (\`userId\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`reaction\` ADD CONSTRAINT \`FK_17d499b6b9cbe038436247cdc66\` FOREIGN KEY (\`announcementId\`) REFERENCES \`announcements\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`announcements\` ADD CONSTRAINT \`FK_92d72877cc8c092c83f37c62752\` FOREIGN KEY (\`authorId\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`announcements\` DROP FOREIGN KEY \`FK_92d72877cc8c092c83f37c62752\``);
        await queryRunner.query(`ALTER TABLE \`reaction\` DROP FOREIGN KEY \`FK_17d499b6b9cbe038436247cdc66\``);
        await queryRunner.query(`ALTER TABLE \`reaction\` DROP FOREIGN KEY \`FK_e58a09ab17e3ce4c47a1a330ae1\``);
        await queryRunner.query(`ALTER TABLE \`comments\` DROP FOREIGN KEY \`FK_2bf4aa41d384038daf10e39a8e8\``);
        await queryRunner.query(`ALTER TABLE \`comments\` DROP FOREIGN KEY \`FK_4548cc4a409b8651ec75f70e280\``);
        await queryRunner.query(`ALTER TABLE \`spends\` DROP FOREIGN KEY \`FK_6518db631ca878f98cc354603fc\``);
        await queryRunner.query(`DROP TABLE \`users\``);
        await queryRunner.query(`DROP TABLE \`announcements\``);
        await queryRunner.query(`DROP INDEX \`IDX_163c1af1ae33bd15ef6a9ad943\` ON \`reaction\``);
        await queryRunner.query(`DROP TABLE \`reaction\``);
        await queryRunner.query(`DROP TABLE \`comments\``);
        await queryRunner.query(`DROP TABLE \`spends\``);
    }

}
