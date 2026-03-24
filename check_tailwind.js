const postcss = require('postcss');
const tailwindcss = require('@tailwindcss/postcss');
const fs = require('fs');

const css = `
@import "tailwindcss";
@custom-variant dark (&:is(.dark, .dark *));

.test {
  @apply dark:bg-[#06060c];
}
`;

postcss([tailwindcss({ base: __dirname })])
  .process(css, { from: 'in.css', to: 'out.css' })
  .then(result => {
    fs.writeFileSync('out.css', result.css);
    console.log("Wrote out.css");
  })
  .catch(err => console.error(err));
