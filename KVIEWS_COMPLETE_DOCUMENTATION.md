# KViews - Documentație Internă

**Versiune:** 2.0.0  
**Actualizat:** 2026

Documentație pentru membrii echipei - ghid de onboarding pentru KViews.

---

## Cuprins

1. [Introducere](#introducere)
   - [Ce este KViews?](#ce-este-kviews)
   - [Când folosim KViews?](#când-folosim-kviews)
   - [Dependențe](#dependențe)
   - [Setup în proiect](#setup-în-proiect)

2. [Arhitectură](#arhitectură)
   - [Concepte de bază](#concepte-de-bază)
   - [Clase principale](#clase-principale)
   - [Flux de date](#flux-de-date)
   - [Sistemul de evenimente](#sistemul-de-evenimente)

3. [API Reference](#api-reference)
   - [KViews Factory](#kviews-factory)
   - [Collection](#collection)
   - [Item](#item)
   - [Storage](#storage)
   - [Paging & Filtering](#paging--filtering)

4. [Templates](#templates)
   - [Handlebars în KViews](#handlebars-în-kviews)
   - [Sintaxă template](#sintaxă-template)
   - [Acces direct la atribute](#acces-direct-la-atribute)
   - [Relații în template-uri](#relații-în-template-uri)

5. [Evenimente](#evenimente)
   - [Evenimente Collection](#evenimente-collection)
   - [Evenimente Item](#evenimente-item)
   - [Gestionare evenimente](#gestionare-evenimente)
   - [Listeners pe item-uri din colecție](#listeners-pe-item-uri-din-colecție)

6. [Exemple practice](#exemple-practice)
   - [Listă de înregistrări](#listă-de-înregistrări)
   - [CRUD complet](#crud-complet)
   - [Integrare formulare](#integrare-formulare)
   - [Filtrare și paginare](#filtrare-și-paginare)
   - [Pattern-uri comune](#pattern-uri-comune)

7. [Best Practices](#best-practices)
   - [Organizare cod](#organizare-cod)
   - [Gestionare erori](#gestionare-erori)
   - [Performance](#performance)

8. [Troubleshooting](#troubleshooting)
   - [Probleme comune](#probleme-comune)
   - [Debugging](#debugging)

---

## Introducere

### Ce este KViews?

KViews este o librărie JavaScript opinionated pentru crearea rapidă de view-uri CRUD în aplicații de business. Este proiectată pentru aplicații interne, admin panels, și interfețe de management unde viteza de dezvoltare este mai importantă decât complexitatea.

**Scopul KViews:**
- Crearea rapidă de interfețe CRUD pentru resurse JSON:API
- Minimizarea boilerplate-ului pentru operațiuni comune (listare, creare, editare, ștergere)
- Oferirea unui API simplu și predictibil pentru aplicații de business

**Ce NU este KViews:**
- Nu este un framework de UI (nu înlocuiește React, Vue, etc.)
- Nu este pentru aplicații complexe cu state management avansat
- Nu este pentru aplicații publice cu cerințe de UX complexe
- Nu este un framework full-stack

**Ce ESTE KViews:**
- O librărie lightweight pentru view-uri CRUD
- Un layer de productivitate peste JSON:API
- O soluție rapidă pentru interfețe de management/admin
- Un tool pentru aplicații interne de business

### Când folosim KViews?

KViews este potrivit pentru:

✅ **Aplicații de business interne:**
- Panouri de administrare
- Interfețe de management pentru resurse
- Dashboards simple
- Formulare CRUD standard

✅ **Cazuri de utilizare tipice:**
- Listare înregistrări cu paginare
- Creare/editare/ștergere înregistrări
- Filtrare și căutare
- Afișare detalii înregistrare

❌ **Când NU folosim KViews:**
- Aplicații publice cu UX complex
- Aplicații care necesită state management avansat
- Aplicații cu routing complex
- Aplicații care necesită optimizări de performance extreme

### Dependențe

KViews necesită:

- **jQuery** (obligatoriu) - pentru manipularea DOM
- **Handlebars** (obligatoriu) - pentru compilarea template-urilor
- **Browser modern** - suport ES6 (Chrome 61+, Firefox 60+, Safari 11+, Edge 16+)

### Setup în proiect

#### Varianta Bundle (fără build step)

Include bundle-ul în HTML:

```html
<!DOCTYPE html>
<html>
<head>
    <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/handlebars@latest/dist/handlebars.min.js"></script>
    <script src="./dist/kviews.js"></script>
</head>
<body>
    <!-- HTML -->
</body>
</html>
```

#### Varianta ES6 Modules

Copiază `src/` în proiect sau importă direct. **jQuery** și **Handlebars** trebuie să fie deja încărcate în pagină (ca script-uri globale) înainte de modulul care importă KViews:

```javascript
import { KViews } from './path/to/kviews/src/index.js';
```

În HTML: `<script src="jquery…">`, apoi `<script src="handlebars…">`, apoi `<script type="module">` cu importul de mai sus.

---

## Arhitectură

### Concepte de bază

KViews folosește patru concepte principale:

1. **Collection** - Reprezintă o listă de înregistrări (ex: lista de utilizatori, lista de comenzi)
2. **Item** - Reprezintă o singură înregistrare (ex: un utilizator, o comandă)
3. **View** - Gestionează renderizarea în DOM (CollectionView pentru liste, ItemView pentru detalii)
4. **Template** - Template Handlebars pentru formatarea datelor

### Clase principale

#### KViews (Factory Class)
Punctul de intrare principal. Oferă metode factory pentru crearea instanțelor:

```javascript
// Creează o colecție
const collection = KViews.createCollectionInstance('#users-list', {
    url: '/api/users',
    type: 'users'
});

// Creează un item
const item = KViews.createItemInstance('#user-detail', {
    url: '/api/users/123',
    type: 'users'
});
```

#### Collection
Gestionează o colecție de item-uri:

- **Responsabilități:**
  - Încărcare date de la API
  - Gestionare item-uri (adaugare, ștergere)
  - Coordonare renderizare prin CollectionView
  - Paginare și filtrare

- **Proprietăți importante:**
  - `items` - Array de instanțe Item
  - `url` - URL-ul endpoint-ului API
  - `type` - Tipul resursei (ex: 'users', 'orders')
  - `view` - Instanță CollectionView pentru renderizare
  - `paging` - Instanță Paging pentru paginare
  - `filtering` - Instanță Filtering pentru filtrare

#### Item
Reprezintă o singură înregistrare:

- **Responsabilități:**
  - Încărcare date item
  - Actualizare date item
  - Ștergere item
  - Coordonare renderizare prin ItemView
  - Gestionare relații

- **Proprietăți importante:**
  - `id` - ID-ul înregistrării
  - `type` - Tipul resursei
  - `attributes` - Atributele înregistrării
  - `relationships` - Relațiile cu alte resurse
  - `views` - Array de instanțe ItemView
  - `collection` - Referință la colecția părinte (dacă există)

### Flux de date

```
JSON:API Response
    ↓
Parser (hydrate relationships)
    ↓
Collection/Item (load data)
    ↓
View (render to DOM)
    ↓
Template (format data)
```

### Sistemul de evenimente

KViews folosește un sistem de evenimente unificat:

- `on(event, callback)` - Adaugă listener
- `off(event, callback)` - Elimină listener
- `once(event, callback)` - Listener care se execută o singură dată
- `emit(event, data)` - Declanșează eveniment manual
- `hasListeners(event)` - Verifică dacă există listeners

**Evenimente Collection:**
- `beforeload` - Înainte de încărcare
- `load` - După încărcare
- `update` - Când colecția se actualizează
- `afterrender` - După renderizare

**Evenimente Item:**
- `beforeload` - Înainte de încărcare
- `load` - După încărcare
- `update` - Când item-ul se actualizează
- `remove` - Când item-ul este șters
- `afterrender` - După renderizare

---

## API Reference

### KViews Factory

#### `KViews.createCollectionInstance(el, opts)`

Creează o instanță Collection legată de un element DOM.

**Parametri:**
- `el` - Element DOM sau selector jQuery (ex: `'#users-list'` sau `document.getElementById('users-list')`)
- `opts` - Opțiuni de configurare sau string URL

**Opțiuni:**
```javascript
{
    url: '/api/users',              // URL endpoint API
    type: 'users',                  // Tip resursă
    template: templateFunction,     // Template Handlebars (opțional)
    pageSize: 20,                  // Items per pagină
    offset: 0,                      // Offset inițial
    emptyview: '#empty-message',    // Element pentru stare goală
    filter: '#filter-form',         // Form pentru filtrare
    paging: '#pagination',          // Element pentru paginare
    addontop: false,                // Adaugă item-uri noi în top
    itemListeners: {                // Listeners pentru item-uri noi
        'load': (item) => { ... }
    }
}
```

**Exemplu:**
```javascript
const collection = KViews.createCollectionInstance('#users-list', {
    url: '/api/users',
    type: 'users',
    pageSize: 20,
    filter: '#user-filter'
});
```

#### `KViews.createItemInstance(el, opts, data)`

Creează o instanță Item legată de un element DOM.

**Parametri:**
- `el` - Element DOM sau selector jQuery
- `opts` - Opțiuni de configurare sau string URL
- `data` - Date inițiale (opțional)

**Opțiuni:**
```javascript
{
    url: '/api/users/123',         // URL endpoint API
    type: 'users',                  // Tip resursă
    template: templateFunction,     // Template Handlebars (opțional)
    emptyview: '#empty-message'     // Element pentru stare goală
}
```

**Exemplu:**
```javascript
const item = KViews.createItemInstance('#user-detail', {
    url: '/api/users/123',
    type: 'users'
});
```

#### `KViews.baseUrl`

Prefix pentru URL-urile **relative** folosite la request-uri (origine completă sau prefix de cale). URL-urile absolute `http(s)://` rămân nemodificate. Dacă sunt setate atât `baseUrl` cât și `basePath`, se folosește `baseUrl`.

```javascript
KViews.baseUrl = 'https://api.example.com';
```

#### `KViews.basePath`

Prefix de cale (ex. `/api/v1`) folosit la fel ca `baseUrl` pentru URL-uri relative, când `baseUrl` nu este setat.

```javascript
KViews.basePath = '/api/v1';
```

#### `KViews.defaultHeaders`

Obiect cu antete HTTP implicite pentru **toate** request-urile (Fetch). Se îmbină cu antetele definite pe instanță (`headers` / `Storage`); la aceeași cheie, valoarea de pe instanță sau de la apelul individual câștigă.

```javascript
KViews.defaultHeaders = { Authorization: 'Bearer ' + token };
// Golire: KViews.defaultHeaders = null;
```

La `createCollectionInstance` / `createItemInstance`, opțiunea `headers: { ... }` adaugă sau suprascrie antete pentru acea instanță. Opțional: `ajaxOpts` pentru constructorul `Storage` (îmbinare cu `headers`).

#### `KViews.helpers`

Funcții utilitare pentru formulare:

```javascript
// Umple formular cu date item
KViews.helpers.fillForm('#edit-form', item);

// Captează submit formular
KViews.helpers.captureFormSubmit('#create-form', (formData) => {
    collection.insert({ attributes: formData });
});

// Extrage date din formular
const formData = KViews.helpers.fetchFormData('#my-form');
```

### Collection

#### Metode principale

**`loadFromRemote()`**
Încarcă date de la API:

```javascript
collection.loadFromRemote().then(() => {
    console.log('Loaded', collection.items.length, 'items');
});
```

**`insert(itemData)`**
Inserează un singur item nou:

```javascript
collection.insert({
    attributes: {
        name: 'John Doe',
        email: 'john@example.com'
    }
}).then((newItem) => {
    console.log('Created item:', newItem);
});
```

**`batchInsert(itemsData)`**
Inserează mai multe item-uri:

```javascript
collection.batchInsert([
    { attributes: { name: 'User 1' } },
    { attributes: { name: 'User 2' } }
]).then((newItems) => {
    console.log('Created', newItems.length, 'items');
});
```

**`render()`**
Renderizează colecția:

```javascript
collection.render();
```

**`clear()`**
Șterge toate item-urile din colecție (sincron):

```javascript
collection.clear();
```

**`destroy()`**
Distruge colecția și eliberează resurse:

```javascript
collection.destroy();
```

#### Evenimente

```javascript
// Ascultă eveniment load
collection.on('load', (collection) => {
    console.log('Collection loaded');
});

// Ascultă eveniment update
collection.on('update', (collection) => {
    console.log('Collection updated');
});

// Elimină listener
const handler = (collection) => { ... };
collection.on('load', handler);
collection.off('load', handler);
```

#### Proprietăți importante

- `items` - Array de instanțe Item
- `length` - Număr de item-uri (getter)
- `url` - URL endpoint API
- `type` - Tip resursă
- `view` - Instanță CollectionView
- `paging` - Instanță Paging (dacă există)
- `filtering` - Instanță Filtering (dacă există)

### Item

#### Metode principale

**`loadFromRemote()`**
Încarcă date item de la API:

```javascript
item.loadFromRemote().then(() => {
    console.log('Item loaded:', item.attributes);
});
```

**`update(updateData, opts)`**
Actualizează item:

```javascript
item.update({
    attributes: {
        name: 'Updated Name'
    }
}, {
    sync: true,      // Trimite imediat la server
    rerender: true   // Re-renderizează după update
}).then(() => {
    console.log('Item updated');
});
```

**`delete(opts)`**
Șterge item:

```javascript
item.delete({
    sync: true  // Trimite imediat la server
}).then(() => {
    console.log('Item deleted');
});
```

**`render()`**
Renderizează item:

```javascript
item.render();
```

**`destroy()`**
Distruge item și eliberează resurse:

```javascript
item.destroy();
```

#### Evenimente

```javascript
// Ascultă eveniment load
item.on('load', (item) => {
    console.log('Item loaded');
});

// Ascultă eveniment update
item.on('update', (item) => {
    console.log('Item updated');
});

// Ascultă eveniment remove
item.on('remove', (item) => {
    console.log('Item removed');
});
```

#### Proprietăți importante

- `id` - ID înregistrare
- `type` - Tip resursă
- `attributes` - Atribute înregistrare
- `relationships` - Relații cu alte resurse
- `views` - Array de instanțe ItemView
- `collection` - Referință la colecția părinte

### Storage

Clasa Storage gestionează operațiunile HTTP (Fetch API). De obicei nu este folosită direct, ci prin Collection și Item.

Antetele pentru fiecare request se construiesc prin îmbinare: `KViews.defaultHeaders`, apoi valorile implicite ale instanței `Storage` (inclusiv `headers` din opțiunile colecției/item-ului), apoi antetele transmise la apelul concret (`sync` / `read` / etc.).

**Metode:**
- `read()` - GET request
- `create()` - POST request
- `update()` - PATCH/PUT request
- `delete()` - DELETE request

### Paging & Filtering

**Paging:**
Creează automat când se specifică `paging` în opțiuni:

```javascript
const collection = KViews.createCollectionInstance('#users', {
    url: '/api/users',
    type: 'users',
    paging: '#pagination',  // Element pentru paginare
    pageSize: 20
});
```

**Filtering:**
Creează automat când se specifică `filter` în opțiuni:

```javascript
const collection = KViews.createCollectionInstance('#users', {
    url: '/api/users',
    type: 'users',
    filter: '#filter-form'  // Form pentru filtrare
});
```

---

## Templates

### Handlebars în KViews

KViews folosește Handlebars pentru template-uri. Template-urile pot fi:

1. **Template din HTML** - Elementul DOM folosit ca template
2. **Template Handlebars compilat** - Funcție Handlebars
3. **Template string** - String cu sintaxă Handlebars

### Sintaxă template

**Acces direct la atribute:**
În template-uri, atributele sunt accesibile direct, nu prin `attributes`:

```handlebars
<!-- ✅ Corect -->
<h2>{{title}}</h2>
<p>{{content}}</p>

<!-- ❌ Greșit -->
<h2>{{attributes.title}}</h2>
```

**Relații:**
Relațiile sunt de asemenea accesibile direct:

```handlebars
<!-- Relație to-one -->
<p>Author: {{author.name}}</p>

<!-- Relație to-many -->
{{#each tags}}
    <span>{{name}}</span>
{{/each}}
```

### Acces direct la atribute

KViews aplatizează atributele și relațiile pentru template-uri:

**Date în runtime:**
```javascript
{
    id: '1',
    type: 'posts',
    attributes: { title: 'Post Title' },
    relationships: {
        author: { id: '10', type: 'users', attributes: { name: 'John' } }
    }
}
```

**În template:**
```handlebars
<h2>{{title}}</h2>           <!-- Din attributes.title -->
<p>By {{author.name}}</p>     <!-- Din relationships.author.attributes.name -->
```

### Relații în template-uri

**Relație to-one:**
```handlebars
<div class="post">
    <h2>{{title}}</h2>
    <p>Author: {{author.name}}</p>
    <p>Category: {{category.name}}</p>
</div>
```

**Relație to-many:**
```handlebars
<div class="post">
    <h2>{{title}}</h2>
    <div class="tags">
        {{#each tags}}
            <span class="tag">{{name}}</span>
        {{/each}}
    </div>
</div>
```

**Verificare null:**
```handlebars
{{#if author}}
    <p>Author: {{author.name}}</p>
{{else}}
    <p>No author</p>
{{/if}}
```

---

## Evenimente

### Evenimente Collection

**`beforeload`**
Declanșat înainte de încărcare:

```javascript
collection.on('beforeload', (collection) => {
    console.log('Loading...');
    // Afișează loading indicator
});
```

**`load`**
Declanșat după încărcare:

```javascript
collection.on('load', (collection) => {
    console.log('Loaded', collection.items.length, 'items');
});
```

**`update`**
Declanșat când colecția se actualizează:

```javascript
collection.on('update', (collection) => {
    console.log('Collection updated');
    // Actualizează UI
});
```

**`afterrender`**
Declanșat după renderizare:

```javascript
collection.on('afterrender', (collection) => {
    console.log('Collection rendered');
    // Inițializează componente UI
});
```

### Evenimente Item

**`beforeload`**
Declanșat înainte de încărcare:

```javascript
item.on('beforeload', (item) => {
    console.log('Loading item...');
});
```

**`load`**
Declanșat după încărcare:

```javascript
item.on('load', (item) => {
    console.log('Item loaded:', item.attributes);
});
```

**`update`**
Declanșat când item-ul se actualizează:

```javascript
item.on('update', (item) => {
    console.log('Item updated');
});
```

**`remove`**
Declanșat când item-ul este șters:

```javascript
item.on('remove', (item) => {
    console.log('Item removed');
});
```

**`afterrender`**
Declanșat după renderizare:

```javascript
item.on('afterrender', (item) => {
    console.log('Item rendered');
});
```

### Gestionare evenimente

**Adăugare listener:**
```javascript
const handler = (collection) => {
    console.log('Event fired');
};
collection.on('load', handler);
```

**Eliminare listener:**
```javascript
collection.off('load', handler);
```

**Listener o singură dată:**
```javascript
collection.once('load', (collection) => {
    console.log('This will fire only once');
});
```

**Verificare listeners:**
```javascript
if (collection.hasListeners('load')) {
    console.log('Has load listeners');
}
```

**Declanșare manuală:**
```javascript
collection.emit('custom-event', collection);
```

### Listeners pe item-uri din colecție

Poți configura listeners pentru toate item-urile create într-o colecție:

```javascript
const collection = KViews.createCollectionInstance('#users', {
    url: '/api/users',
    type: 'users',
    itemListeners: {
        'load': (item) => {
            console.log('Item loaded:', item.id);
        },
        'update': (item) => {
            console.log('Item updated:', item.id);
        }
    }
});
```

Sau folosind `itemOn`:

```javascript
const collection = KViews.createCollectionInstance('#users', {
    url: '/api/users',
    type: 'users',
    itemOn: {
        'load': (item) => {
            console.log('Item loaded:', item.id);
        }
    }
});
```

---

## Exemple practice

### Listă de înregistrări

**HTML:**
```html
<div id="users-list">
    <div class="user-item">
        <h3>{{name}}</h3>
        <p>{{email}}</p>
        <button class="edit-btn" data-id="{{id}}">Edit</button>
        <button class="delete-btn" data-id="{{id}}">Delete</button>
    </div>
</div>
```

**JavaScript:**
```javascript
const collection = KViews.createCollectionInstance('#users-list', {
    url: '/api/users',
    type: 'users',
    pageSize: 20
});

// Ascultă eveniment load
collection.on('load', (collection) => {
    console.log('Loaded', collection.items.length, 'users');
});

// Încarcă date
collection.loadFromRemote();
```

### CRUD complet

**Creare:**
```javascript
// Formular de creare
$('#create-form').on('submit', (e) => {
    e.preventDefault();
    const formData = KViews.helpers.fetchFormData('#create-form');
    
    collection.insert({
        attributes: formData
    }).then((newItem) => {
        console.log('Created:', newItem);
        $('#create-form')[0].reset();
    });
});
```

**Editare:**
```javascript
// Deschide formular de editare cu date item
$('#users-list').on('click', '.edit-btn', function() {
    const itemId = $(this).data('id');
    const item = collection.items.find(i => i.id === itemId);
    
    if (item) {
        KViews.helpers.fillForm('#edit-form', item);
        $('#edit-modal').show();
    }
});

// Salvează modificări
$('#edit-form').on('submit', (e) => {
    e.preventDefault();
    const formData = KViews.helpers.fetchFormData('#edit-form');
    const itemId = formData.id;
    const item = collection.items.find(i => i.id === itemId);
    
    if (item) {
        item.update({
            attributes: formData
        }).then(() => {
            $('#edit-modal').hide();
        });
    }
});
```

**Ștergere:**
```javascript
$('#users-list').on('click', '.delete-btn', function() {
    const itemId = $(this).data('id');
    const item = collection.items.find(i => i.id === itemId);
    
    if (item && confirm('Delete this item?')) {
        item.delete().then(() => {
            console.log('Item deleted');
        });
    }
});
```

### Integrare formulare

**Umplere formular cu date item:**
```javascript
const item = KViews.createItemInstance('#user-detail', {
    url: '/api/users/123',
    type: 'users'
});

item.loadFromRemote().then(() => {
    KViews.helpers.fillForm('#edit-form', item);
});
```

**Captare submit formular:**
```javascript
KViews.helpers.captureFormSubmit('#create-form', (formData) => {
    collection.insert({
        attributes: formData
    });
});
```

### Filtrare și paginare

**Filtrare:**
```html
<form id="user-filter">
    <input type="text" name="name" placeholder="Name">
    <input type="email" name="email" placeholder="Email">
    <button type="submit">Filter</button>
</form>

<div id="users-list">
    <!-- Template -->
</div>
```

```javascript
const collection = KViews.createCollectionInstance('#users-list', {
    url: '/api/users',
    type: 'users',
    filter: '#user-filter'  // Activează filtrare automată
});
```

**Paginare:**
```html
<div id="users-list">
    <!-- Template -->
</div>
<div id="pagination"></div>
```

```javascript
const collection = KViews.createCollectionInstance('#users-list', {
    url: '/api/users',
    type: 'users',
    paging: '#pagination',  // Activează paginare automată
    pageSize: 20
});
```

### Pattern-uri comune

**Pattern: Listă cu acțiuni pe item**
```javascript
const collection = KViews.createCollectionInstance('#orders-list', {
    url: '/api/orders',
    type: 'orders'
});

// Acțiuni pe item-uri
collection.on('afterrender', () => {
    $('#orders-list').on('click', '.approve-btn', function() {
        const itemId = $(this).data('id');
        const item = collection.items.find(i => i.id === itemId);
        
        item.update({
            attributes: { status: 'approved' }
        });
    });
});
```

**Pattern: Refresh după operații**
```javascript
// După creare/editare/ștergere, refresh colecție
collection.on('update', () => {
    collection.loadFromRemote();
});
```

**Pattern: Loading indicator**
```javascript
collection.on('beforeload', () => {
    $('#loading').show();
});

collection.on('load', () => {
    $('#loading').hide();
});
```

---

## Best Practices

### Organizare cod

**1. Separare responsabilități:**
```javascript
// ✅ Bine - separare clară
const initUsersCollection = () => {
    return KViews.createCollectionInstance('#users-list', {
        url: '/api/users',
        type: 'users'
    });
};

const setupUserActions = (collection) => {
    collection.on('afterrender', () => {
        // Setup acțiuni
    });
};

const collection = initUsersCollection();
setupUserActions(collection);
```

**2. Folosește evenimente pentru decuplare:**
```javascript
// ✅ Bine - folosește evenimente
collection.on('load', updateStats);
collection.on('update', refreshCounters);

// ❌ Rău - coupling direct
collection.on('load', () => {
    updateStats();
    refreshCounters();
    // ... multe responsabilități
});
```

### Gestionare erori

**Handling erori în promise-uri:**
```javascript
collection.insert({ attributes: {...} })
    .then((item) => {
        console.log('Success:', item);
    })
    .catch((error) => {
        console.error('Error:', error);
        // Afișează mesaj utilizator
        alert('Failed to create item');
    });
```

**Handling erori HTTP:**
```javascript
item.update({ attributes: {...} })
    .catch((error) => {
        if (error instanceof KViewsHttpError) {
            if (error.status === 404) {
                alert('Item not found');
            } else if (error.status === 422) {
                alert('Validation error: ' + error.responseJSON.errors);
            } else {
                alert('Server error: ' + error.status);
            }
        } else {
            alert('Network error');
        }
    });
```

### Performance

**1. Evită re-renderizări inutile:**
```javascript
// ✅ Bine - renderizează doar când e necesar
item.update({ attributes: {...} }, { rerender: false });
// ... alte operații
item.render(); // Renderizează o singură dată

// ❌ Rău - renderizează de fiecare dată
item.update({ attributes: {...} }); // rerender: true implicit
```

**2. Folosește destroy() când nu mai ai nevoie:**
```javascript
// Când închizi o secțiune
collection.destroy();
item.destroy();
```

**3. Evită memory leaks:**
```javascript
// Elimină listeners când nu mai sunt necesari
const handler = (collection) => { ... };
collection.on('load', handler);

// Când nu mai ai nevoie
collection.off('load', handler);
```

---

## Troubleshooting

### Probleme comune

**1. Template-ul nu se renderizează:**
- Verifică că Handlebars este încărcat
- Verifică că template-ul este valid Handlebars
- Verifică că elementul DOM există

**2. Datele nu se încarcă:**
- Verifică URL-ul API
- Verifică formatul JSON:API al răspunsului
- Verifică console pentru erori

**3. Evenimentele nu se declanșează:**
- Verifică că listener-ul este adăugat înainte de operație
- Verifică că folosești `on()` nu proprietăți directe

**4. Item-urile se șterg la creare:**
- Verifică că folosești `insert()` nu `append()` pentru un singur item
- Verifică `navtype` - pentru 'page' se înlocuiesc item-urile

### Debugging

**Activează debug logging:**
```javascript
// Setează nivel de logging
window.kviewsLogLevel = 3; // 1=error, 2=log, 3=debug

// Acum vei vedea log-uri detaliate în console
```

**Verifică starea colecției:**
```javascript
console.log('Collection items:', collection.items);
console.log('Collection length:', collection.length);
console.log('Collection URL:', collection.url);
```

**Verifică starea item-ului:**
```javascript
console.log('Item attributes:', item.attributes);
console.log('Item relationships:', item.relationships);
console.log('Item views:', item.views);
```

---

## Concluzie

KViews este o librărie simplă și directă pentru crearea rapidă de interfețe CRUD în aplicații de business. Nu este un framework complex, ci un tool de productivitate care minimizează boilerplate-ul pentru operațiuni comune.

**Principii de bază:**
- Keep it simple - KViews este pentru cazuri simple
- Use events - Evenimentele permit decuplare
- Don't fight it - Acceptă opiniile KViews, nu încerca să le schimbi
- Business apps - KViews este pentru aplicații de business, nu aplicații publice complexe

Pentru întrebări sau probleme, consultă codul sursă sau întreabă membrii echipei.
