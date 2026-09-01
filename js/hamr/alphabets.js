/**
 * Output alphabets for ha.mr-style URL compression.
 *
 * Vendored/adapted from https://github.com/p2r3/ha.mr (docs/alphabets.js)
 * Copyright (c) 2026 p2r3 — MIT License (see ./LICENSE)
 *
 * Classic script for file:// compatibility (no ES modules).
 * `%` and `^` are reserved as payload mode prefixes (not in these sets).
 */
var outputAlphabetASCII =
  "!#$&'()*+,-./0123456789:;=?~@ABCDEFGHIJKLMNOPQRSTUVWXYZ[]_abcdefghijklmnopqrstuvwxyz".split(
    ""
  );

/* Extra printable ASCII safe in hash fragments → fewer symbols for the same bits */
var outputAlphabetDense = outputAlphabetASCII.concat(
  "\"<>\\`{|}".split("")
);
