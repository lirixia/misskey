/*
 * SPDX-FileCopyrightText: syuilo and misskey-project
 * SPDX-License-Identifier: AGPL-3.0-only
 */

export class LirisiaRepo1744523095345 {
	async up(queryRunner) {
		await queryRunner.query(
			`UPDATE "meta" SET "repositoryUrl" = 'https://github.com/lirixia/misskey' WHERE "repositoryUrl" = 'https://github.com/catsmiry/misskey'`
		);
		await queryRunner.query(
			`UPDATE "meta" SET "feedbackUrl" = 'https://github.com/lirixia/misskey/issues/new' WHERE "feedbackUrl" = 'https://github.com/catsmiry/misskey/issues/new'`
		);
	}

	async down(queryRunner) {
		await queryRunner.query(
			`UPDATE "meta" SET "feedbackUrl" = 'https://github.com/catsmiry/misskey/issues/new' WHERE "feedbackUrl" = 'https://github.com/lirixia/misskey/issues/new'`
		);
		await queryRunner.query(
			`UPDATE "meta" SET "repositoryUrl" = 'https://github.com/catsmiry/misskey' WHERE "repositoryUrl" = 'https://github.com/lirixia/misskey'`
		);
	}
}
