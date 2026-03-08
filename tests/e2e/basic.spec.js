import { test, expect } from '@playwright/test';

test('should create collection instance', async ({ page }) => {
    // Load jQuery first
    await page.addScriptTag({ url: 'https://code.jquery.com/jquery-3.6.0.min.js' });
    // Load Handlebars and KViews bundle
    await page.addScriptTag({ url: 'https://cdn.jsdelivr.net/npm/handlebars@latest/dist/handlebars.min.js' });
    await page.addScriptTag({ path: './dist/kviews.js' });
    
    await page.setContent(`
        <div id="collection">
            <div class="item">
                <h2>{{title}}</h2>
                <p>{{content}}</p>
            </div>
        </div>
    `);

    await page.evaluate(() => {
        window.KViews.createCollectionInstance('#collection', {
            url: '/api/posts',
            type: 'posts',
            dontload: true
        });
    });

    const collection = await page.$('#collection');
    expect(collection).toBeTruthy();
});

test('should render collection items', async ({ page }) => {
    // Load jQuery first
    await page.addScriptTag({ url: 'https://code.jquery.com/jquery-3.6.0.min.js' });
    // Load Handlebars and KViews bundle
    await page.addScriptTag({ url: 'https://cdn.jsdelivr.net/npm/handlebars@latest/dist/handlebars.min.js' });
    await page.addScriptTag({ path: './dist/kviews.js' });
    
    // Mock API response
    await page.route('**/api/posts', route => {
            route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({
                    data: [
                        {
                            id: '1',
                            type: 'posts',
                            attributes: {
                                title: 'Test Post 1',
                                content: 'Content 1'
                            }
                        },
                        {
                            id: '2',
                            type: 'posts',
                            attributes: {
                                title: 'Test Post 2',
                                content: 'Content 2'
                            }
                        }
                    ]
                })
            });
        });

    await page.setContent(`
        <div id="collection">
            <div class="item">
                <h2>{{title}}</h2>
                <p>{{content}}</p>
            </div>
        </div>
    `);

    await page.evaluate(() => {
        window.KViews.createCollectionInstance('#collection', {
            url: '/api/posts',
            type: 'posts'
        });
    });

    // Wait for items to render
    await page.waitForSelector('#collection .item', { timeout: 5000 });

    const items = await page.$$('#collection .item');
    expect(items.length).toBeGreaterThan(0);
});

test('should handle form submission', async ({ page }) => {
    // Load jQuery first
    await page.addScriptTag({ url: 'https://code.jquery.com/jquery-3.6.0.min.js' });
    // Load Handlebars and KViews bundle
    await page.addScriptTag({ url: 'https://cdn.jsdelivr.net/npm/handlebars@latest/dist/handlebars.min.js' });
    await page.addScriptTag({ path: './dist/kviews.js' });
    await page.setContent(`
        <form id="create-form">
            <input name="title" value="New Post">
            <input name="content" value="New Content">
            <button type="submit">Create</button>
        </form>
        <div id="collection">
            <div class="item">
                <h2>{{title}}</h2>
            </div>
        </div>
    `);

    await page.evaluate(() => {
        const collection = window.KViews.createCollectionInstance('#collection', {
            url: '/api/posts',
            type: 'posts',
            dontload: true
        });

        window.KViews.helpers.captureFormSubmit('#create-form', (formData) => {
            collection.append({ attributes: formData });
        });
    });

    await page.click('button[type="submit"]');
    // Add assertions based on your implementation
});
