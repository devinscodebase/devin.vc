import { defineConfig } from 'sanity';
import { structureTool } from 'sanity/structure';
import { journal } from './src/sanity/schema/journal';
import { testimonial } from './src/sanity/schema/testimonial';

export default defineConfig({
  name: 'devin',
  title: 'Devin Alexander',
  projectId: 'ka7dwvnq',
  dataset: 'production',
  plugins: [structureTool()],
  schema: {
    types: [journal, testimonial],
  },
});
