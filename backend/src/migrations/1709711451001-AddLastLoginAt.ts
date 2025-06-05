import { MigrationInterface, QueryRunner } from "typeorm";

export class AddLastLoginAt1709711451001 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // Check if the column exists
        const hasColumn = await queryRunner.hasColumn('users', 'lastLoginAt');
        
        if (!hasColumn) {
            // Add the lastLoginAt column
            await queryRunner.query(`ALTER TABLE "users" ADD COLUMN "lastLoginAt" TIMESTAMP`);
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Remove the lastLoginAt column
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "lastLoginAt"`);
    }
} 