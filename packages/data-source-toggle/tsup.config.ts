import { defineConfig } from 'tsup'

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    context: 'src/context.ts',
    toggle: 'src/toggle.tsx',
  },
  format: ['cjs', 'esm'],
  dts: true,
  clean: true,
  external: ['react', 'lucide-react'],
})
