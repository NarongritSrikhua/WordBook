import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdatePracticeHistory1709711451000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // First, make userId nullable
        await queryRunner.query(`ALTER TABLE "practice_history" ALTER COLUMN "userId" DROP NOT NULL`);

        // Get the first user ID from the users table to use as default
        const defaultUser = await queryRunner.query(`SELECT id FROM "users" LIMIT 1`);
        const defaultUserId = defaultUser[0]?.id;

        if (defaultUserId) {
            // Update all null userId records with the default user ID
            await queryRunner.query(`UPDATE "practice_history" SET "userId" = $1 WHERE "userId" IS NULL`, [defaultUserId]);
        }

        // Now make userId NOT NULL
        await queryRunner.query(`ALTER TABLE "practice_history" ALTER COLUMN "userId" SET NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Revert the changes if needed
        await queryRunner.query(`ALTER TABLE "practice_history" ALTER COLUMN "userId" DROP NOT NULL`);
    }
} 