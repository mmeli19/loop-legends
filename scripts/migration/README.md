# One-time migration scripts (already applied)

These scripts moved the original single-file HTML apps (now in `legacy/`) into the Next.js project. They have already been run, and the files they produced have since been edited by hand. **Do not run them again**, or they will overwrite the new units, TEKS map, and added styles.

- `extract.js`: pulled the question banks out of the original HTML files into `lib/*/content.json`, and pulled their CSS.
- `scope-css.js`: prefixed each app's CSS (`.ll-s` for students, `.ll-t` for teachers) so the two apps can share one site without style clashes.
- `new-units.js`: added units 13–17 and the TEKS map so every Computer Science I student expectation is covered.
- `teks-list.js`: the list of all 62 Computer Science I student expectations, paraphrased and grouped by strand.
