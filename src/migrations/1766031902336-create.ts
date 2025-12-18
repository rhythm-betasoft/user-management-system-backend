import { MigrationInterface, QueryRunner } from "typeorm";

export class Create1766031902336 implements MigrationInterface {
    name = 'Create1766031902336'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`leave_details\` (\`id\` int NOT NULL AUTO_INCREMENT, \`leaveType\` varchar(255) NOT NULL, \`leaveDurationType\` varchar(255) NOT NULL, \`applied_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`startDate\` datetime NOT NULL, \`endDate\` datetime NULL, \`reason\` varchar(500) NOT NULL, \`pendingLeaves\` int NOT NULL, \`status\` int NOT NULL DEFAULT '0', \`user_id\` int NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`comments\` DROP FOREIGN KEY \`FK_4548cc4a409b8651ec75f70e280\``);
        await queryRunner.query(`ALTER TABLE \`comments\` DROP FOREIGN KEY \`FK_2bf4aa41d384038daf10e39a8e8\``);
        await queryRunner.query(`ALTER TABLE \`comments\` CHANGE \`authorId\` \`authorId\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`comments\` CHANGE \`announcementId\` \`announcementId\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`reaction\` DROP FOREIGN KEY \`FK_e58a09ab17e3ce4c47a1a330ae1\``);
        await queryRunner.query(`ALTER TABLE \`reaction\` DROP FOREIGN KEY \`FK_17d499b6b9cbe038436247cdc66\``);
        await queryRunner.query(`DROP INDEX \`IDX_163c1af1ae33bd15ef6a9ad943\` ON \`reaction\``);
        await queryRunner.query(`ALTER TABLE \`reaction\` CHANGE \`userId\` \`userId\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`reaction\` CHANGE \`announcementId\` \`announcementId\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`announcements\` DROP FOREIGN KEY \`FK_92d72877cc8c092c83f37c62752\``);
        await queryRunner.query(`ALTER TABLE \`announcements\` CHANGE \`authorId\` \`authorId\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`users\` CHANGE \`twoFactorSecret\` \`twoFactorSecret\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`users\` DROP COLUMN \`trustedDevices\``);
        await queryRunner.query(`ALTER TABLE \`users\` ADD \`trustedDevices\` json NULL`);
        await queryRunner.query(`CREATE UNIQUE INDEX \`IDX_163c1af1ae33bd15ef6a9ad943\` ON \`reaction\` (\`userId\`, \`announcementId\`, \`type\`)`);
        await queryRunner.query(`ALTER TABLE \`comments\` ADD CONSTRAINT \`FK_4548cc4a409b8651ec75f70e280\` FOREIGN KEY (\`authorId\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`comments\` ADD CONSTRAINT \`FK_2bf4aa41d384038daf10e39a8e8\` FOREIGN KEY (\`announcementId\`) REFERENCES \`announcements\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`reaction\` ADD CONSTRAINT \`FK_e58a09ab17e3ce4c47a1a330ae1\` FOREIGN KEY (\`userId\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`reaction\` ADD CONSTRAINT \`FK_17d499b6b9cbe038436247cdc66\` FOREIGN KEY (\`announcementId\`) REFERENCES \`announcements\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`announcements\` ADD CONSTRAINT \`FK_92d72877cc8c092c83f37c62752\` FOREIGN KEY (\`authorId\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`leave_details\` ADD CONSTRAINT \`FK_082b99f8c8aef56e1b205833fd1\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`leave_details\` DROP FOREIGN KEY \`FK_082b99f8c8aef56e1b205833fd1\``);
        await queryRunner.query(`ALTER TABLE \`announcements\` DROP FOREIGN KEY \`FK_92d72877cc8c092c83f37c62752\``);
        await queryRunner.query(`ALTER TABLE \`reaction\` DROP FOREIGN KEY \`FK_17d499b6b9cbe038436247cdc66\``);
        await queryRunner.query(`ALTER TABLE \`reaction\` DROP FOREIGN KEY \`FK_e58a09ab17e3ce4c47a1a330ae1\``);
        await queryRunner.query(`ALTER TABLE \`comments\` DROP FOREIGN KEY \`FK_2bf4aa41d384038daf10e39a8e8\``);
        await queryRunner.query(`ALTER TABLE \`comments\` DROP FOREIGN KEY \`FK_4548cc4a409b8651ec75f70e280\``);
        await queryRunner.query(`DROP INDEX \`IDX_163c1af1ae33bd15ef6a9ad943\` ON \`reaction\``);
        await queryRunner.query(`ALTER TABLE \`users\` DROP COLUMN \`trustedDevices\``);
        await queryRunner.query(`ALTER TABLE \`users\` ADD \`trustedDevices\` longtext COLLATE "utf8mb4_bin" NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`users\` CHANGE \`twoFactorSecret\` \`twoFactorSecret\` varchar(255) NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`announcements\` CHANGE \`authorId\` \`authorId\` int NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`announcements\` ADD CONSTRAINT \`FK_92d72877cc8c092c83f37c62752\` FOREIGN KEY (\`authorId\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`reaction\` CHANGE \`announcementId\` \`announcementId\` int NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`reaction\` CHANGE \`userId\` \`userId\` int NULL DEFAULT 'NULL'`);
        await queryRunner.query(`CREATE UNIQUE INDEX \`IDX_163c1af1ae33bd15ef6a9ad943\` ON \`reaction\` (\`userId\`, \`announcementId\`, \`type\`)`);
        await queryRunner.query(`ALTER TABLE \`reaction\` ADD CONSTRAINT \`FK_17d499b6b9cbe038436247cdc66\` FOREIGN KEY (\`announcementId\`) REFERENCES \`announcements\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`reaction\` ADD CONSTRAINT \`FK_e58a09ab17e3ce4c47a1a330ae1\` FOREIGN KEY (\`userId\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`comments\` CHANGE \`announcementId\` \`announcementId\` int NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`comments\` CHANGE \`authorId\` \`authorId\` int NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`comments\` ADD CONSTRAINT \`FK_2bf4aa41d384038daf10e39a8e8\` FOREIGN KEY (\`announcementId\`) REFERENCES \`announcements\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`comments\` ADD CONSTRAINT \`FK_4548cc4a409b8651ec75f70e280\` FOREIGN KEY (\`authorId\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`DROP TABLE \`leave_details\``);
    }

}
