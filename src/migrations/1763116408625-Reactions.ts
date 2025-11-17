import { MigrationInterface, QueryRunner } from "typeorm";

export class Reactions1763116408625 implements MigrationInterface {
    name = 'Reactions1763116408625'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`reaction\` (\`id\` int NOT NULL AUTO_INCREMENT, \`type\` varchar(32) NOT NULL, \`userId\` int NULL, \`announcementId\` int NULL, UNIQUE INDEX \`IDX_163c1af1ae33bd15ef6a9ad943\` (\`userId\`, \`announcementId\`, \`type\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`users\` CHANGE \`blood_group\` \`blood_group\` varchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`users\` CHANGE \`religion\` \`religion\` varchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`users\` CHANGE \`age\` \`age\` int NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`users\` CHANGE \`role\` \`role\` varchar(255) NOT NULL`);
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
        await queryRunner.query(`ALTER TABLE \`users\` CHANGE \`role\` \`role\` varchar(255) NOT NULL DEFAULT 'user'`);
        await queryRunner.query(`ALTER TABLE \`users\` CHANGE \`age\` \`age\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`users\` CHANGE \`religion\` \`religion\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`users\` CHANGE \`blood_group\` \`blood_group\` varchar(255) NULL DEFAULT 'unknown'`);
        await queryRunner.query(`DROP INDEX \`IDX_163c1af1ae33bd15ef6a9ad943\` ON \`reaction\``);
        await queryRunner.query(`DROP TABLE \`reaction\``);
    }

}
