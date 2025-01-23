/*
 * SPDX-FileCopyrightText: lqvp
 * SPDX-License-Identifier: AGPL-3.0-only
 */

export class AddAllowedAvatarDecorationHosts1737644913909 {
	name = 'AddAllowedAvatarDecorationHosts1737644913909'

	async up(queryRunner) {
			await queryRunner.query(`ALTER TABLE "meta" ADD "allowedAvatarDecorationHosts" character varying(256) array NOT NULL DEFAULT '{}'`);
	}

	async down(queryRunner) {
			await queryRunner.query(`ALTER TABLE "meta" DROP COLUMN "allowedAvatarDecorationHosts"`);
	}
}
