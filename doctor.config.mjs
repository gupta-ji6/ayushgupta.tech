export default {
  ignore: {
    files: [
      '.claude/**/.netlify/**',
      '.netlify/functions-serve/**',
      'doctor.config.mjs',
    ],
    overrides: [
      {
        files: ['netlify/functions/spotify.cjs'],
        rules: ['deslop/unused-file'],
      },
    ],
  },
};
