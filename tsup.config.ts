import { defineConfig } from 'tsup'

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    context: 'src/context.ts',
    toggle: 'src/toggle.tsx',
    'toggle-unstyled': 'src/toggle-unstyled.tsx',
  },
  format: ['cjs', 'esm'],
  dts: true,
  clean: true,
  external: ['react', 'lucide-react'],
  loader: {
    '.css': 'copy',
  },
  onSuccess: 'cp src/toggle.css dist/toggle.css',
})
