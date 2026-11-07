# Random public IDs

Deploy the updated server and client before migrating existing records. The new server resolves old IDs through `legacyPublicIds`; old URLs redirect permanently to the canonical URL.

From `server`, inspect the number of affected records without writing:

```sh
npm run db:migrate-random-ids
```

Apply the conversion:

```sh
npm run db:migrate-random-ids -- --apply
```

Games receive `bazi` plus five random lowercase letters/digits; magazine records receive `mag` plus five random lowercase letters/digits. Codes are reserved atomically in MongoDB to prevent collisions between simultaneous uploads, creation and migration. Internal MongoDB IDs and relationships remain unchanged. Re-running skips records already using the new format.

URLs:

- `/games/bazi7k2mx/ufc-6`
- `/magazine/tutorial/mag4p9ax/enabling-psn-with-fake-id`
- `/magazine/tutorial/playstation/mag4p9ax/enabling-psn-with-fake-id`

The category slug is configurable in the category create/edit form. Parent category slugs are included in order; a root category named/sluggified `magazine`, `magazines` or `مجله` is omitted because `/magazine` already identifies the section. Category pages include their descendants. Existing categories without a slug use their name until an explicit slug is saved.
