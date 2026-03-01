import { defineConfig } from 'sanity';
import { structureTool } from 'sanity/structure';
import { journal } from './src/sanity/schema/journal';

export default defineConfig({
  name: 'devin',
  title: 'Devin Alexander',
  projectId: 'ka7dwvnq',
  dataset: 'production',
  plugins: [structureTool()],
  schema: {
    types: [journal],
  },
});
