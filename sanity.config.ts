import { defineConfig } from 'sanity';
import { structureTool } from 'sanity/structure';
import { journal } from './src/sanity/schema/journal';
import { project } from './src/sanity/schema/project';
import { testimonial } from './src/sanity/schema/testimonial';
import { tool } from './src/sanity/schema/tool';
import { trainingAsset } from './src/sanity/schema/trainingAsset';

export default defineConfig({
  name: 'devin',
  title: 'Devin Alexander',
  projectId: 'ka7dwvnq',
  dataset: 'production',
  plugins: [structureTool()],
  schema: {
    types: [journal, project, testimonial, tool, trainingAsset],
  },
});
