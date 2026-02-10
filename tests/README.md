# KViews Test Suite

Test suite pentru biblioteca KViews, folosind Vitest pentru unit tests și Playwright pentru teste end-to-end.

## Structura Testelor

```
tests/
├── setup.js              # Configurare globală pentru teste
├── unit/                 # Teste unitare
│   ├── KViews.test.js    # Teste pentru clasa KViews
│   ├── URL.test.js       # Teste pentru clasa URL
│   ├── Storage.test.js   # Teste pentru clasa Storage
│   └── utilities.test.js # Teste pentru utilități
├── integration/          # Teste de integrare
│   ├── collection.test.js
│   └── item.test.js
└── e2e/                  # Teste end-to-end
    └── basic.spec.js
```

## Rularea Testelor

### Unit Tests (Vitest)

```bash
# Rulare o singură dată
npm run test

# Rulare în mod watch (re-rulare automată la modificări)
npm run test:watch

# Interfață UI pentru teste
npm run test:ui

# Cu coverage
npm run test:coverage
```

### E2E Tests (Playwright)

```bash
# Rulare teste E2E
npm run test:e2e

# Interfață UI pentru E2E
npm run test:e2e:ui

# Rulare toate testele
npm run test:all
```

## Scrierea de Teste Noi

### Unit Test Example

```javascript
import { describe, it, expect } from 'vitest';
import { KViews } from '../../src/KViews.js';

describe('KViews', () => {
    it('should create collection instance', () => {
        const el = document.createElement('div');
        const collection = KViews.createCollectionInstance(el, {
            url: '/api/posts',
            type: 'posts',
            dontload: true
        });
        
        expect(collection).toBeDefined();
    });
});
```

### E2E Test Example

```javascript
import { test, expect } from '@playwright/test';

test('should render collection', async ({ page }) => {
    await page.setContent('<div id="collection"></div>');
    // ... test logic
});
```

## Mock-uri

### Handlebars
Handlebars este mock-uit în `tests/setup.js` pentru a funcționa în mediul de testare.

### Fetch API
Fetch API poate fi mock-uit în teste individuale:

```javascript
const mockFetch = vi.fn();
global.fetch = mockFetch;

mockFetch.mockResolvedValueOnce({
    ok: true,
    status: 200,
    text: () => Promise.resolve('{"data": []}')
});
```

## Coverage

Pentru a genera raport de coverage:

```bash
npm run test:coverage
```

Raportul va fi disponibil în `coverage/` directory.

## Best Practices

1. **Teste unitare**: Testează funcționalități izolate, fără dependențe externe
2. **Teste de integrare**: Testează interacțiunea între componente
3. **Teste E2E**: Testează fluxuri complete în browser
4. **Mock-uri**: Folosește mock-uri pentru API calls și dependențe externe
5. **Cleanup**: Curăță starea după fiecare test (`beforeEach`, `afterEach`)
