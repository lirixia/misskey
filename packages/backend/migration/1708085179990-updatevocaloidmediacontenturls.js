export class UpdateMisskeyMediaContentUrls1708085179990 {
  name = 'UpdateMisskeyMediaContentUrls1708085179990';
  async up(queryRunner) {
    // Update avatarUrl in public.user table
    await queryRunner.query(`
          UPDATE "public"."user"
          SET "avatarUrl" = REPLACE("avatarUrl", 'media.vocaloid.app', 'vocaloid.media')
          WHERE "avatarUrl" LIKE '%media.vocaloid.app%';
      `);
    // Update originalUrl in public.emoji table
    await queryRunner.query(`
          UPDATE "public"."emoji"
          SET "originalUrl" = REPLACE("originalUrl", 'media.vocaloid.app', 'vocaloid.media')
          WHERE "originalUrl" LIKE '%media.vocaloid.app%';
      `);
    // Update publicUrl in public.emoji table
    await queryRunner.query(`
          UPDATE "public"."emoji"
          SET "publicUrl" = REPLACE("publicUrl", 'media.vocaloid.app', 'vocaloid.media')
          WHERE "publicUrl" LIKE '%media.vocaloid.app%';
      `);
    // Update url, uri, src in public.drive_file table
    await queryRunner.query(`
          UPDATE "public"."drive_file"
          SET "url" = REPLACE("url", 'media.vocaloid.app', 'vocaloid.media'),
              "uri" = REPLACE("uri", 'media.vocaloid.app', 'vocaloid.media'),
              "src" = REPLACE("src", 'media.vocaloid.app', 'vocaloid.media')
          WHERE "url" LIKE '%media.vocaloid.app%'
             OR "uri" LIKE '%media.vocaloid.app%'
             OR "src" LIKE '%media.vocaloid.app%';
      `);
  }
  async down(queryRunner) {
    // Revert the updates if needed
    // This section will contain the code to revert the changes made in the 'up' function
    // It's important to ensure your down function can revert the changes safely
  }
}