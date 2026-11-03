import { defineConfig } from '@playwright/test';

export default defineConfig({
    // Bezpiecznik (LK-1.04): przerywa testy, zanim cokolwiek dotknie bazy innej niż lokalna.
    globalSetup: './tests/global-setup.ts',
});
