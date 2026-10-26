# TreeLab · Directorio de desarrolladores con Árbol Binario de Búsqueda

**Estructuras de Datos · Cuarto Semestre · Universidad Cooperativa de Colombia**

TreeLab es una aplicación web que guarda un directorio de desarrolladores de software en un **Árbol Binario de Búsqueda (BST)** y muestra visualmente cada operación sobre el árbol: búsqueda, inserción, eliminación, recorridos, rebalanceo y ordenamiento de números.

El proyecto amplía los dos ejemplos vistos en clase:

1. **Agenda telefónica (Phonebook):** nodos con `name` y `phone_number`, insertados y buscados en orden alfabético. Si se inserta un nombre que ya existe, se actualiza su teléfono.
2. **Ordenamiento:** clase `BinaryTree` con `add`, `add_recursive` e `in_order_asc` sobre números enteros.

---

## Tabla de contenido

- [Cómo ejecutarlo](#cómo-ejecutarlo)
- [Estructura del proyecto](#estructura-del-proyecto)
- [Funcionalidades](#funcionalidades)
- [Teoría aplicada](#teoría-aplicada)
- [Backend: `tree.py`](#backend-treepy)
- [Servidor y API: `server.py`](#servidor-y-api-serverpy)
- [Frontend](#frontend)
- [Datos de ejemplo](#datos-de-ejemplo)
- [Atajos de teclado](#atajos-de-teclado)
- [Tecnologías](#tecnologías)

---

## Cómo ejecutarlo

Requisitos: **Python 3**. No hay que instalar librerías, porque todo usa la biblioteca estándar.

```bash
python server.py
```

Luego abre en el navegador:

```
http://localhost:8000
```

El servidor arranca con el directorio y el árbol de números ya cargados. Para detenerlo, presiona `Ctrl + C` en la terminal.

---

## Estructura del proyecto

```
├── server.py          Servidor HTTP y API JSON (puerto 8000)
├── tree.py            Árbol binario de búsqueda, árbol de enteros y datos semilla
└── static/
    ├── index.html     Estructura de la interfaz
    ├── style.css      Diseño, temas claro/oscuro y animaciones
    └── app.js         Lógica de la interfaz, dibujo del árbol y animaciones
```

---

## Funcionalidades

### Directorio (árbol de desarrolladores)

| Operación | Qué hace | Animación |
|---|---|---|
| **Buscar** | Recorre el árbol desde la raíz comparando nombres alfabéticamente | Un cometa viaja nodo por nodo con burbujas de comparación (`Diana < Jhonatan → izquierda`). Si lo encuentra, hay confeti; si no, el lienzo tiembla |
| **Insertar** | Ubica al nuevo desarrollador según el orden alfabético | Se recorre el camino de descenso, el nodo aparece con un rebote y la arista se dibuja |
| **Actualizar** | Cambia teléfono, rol o tecnologías de un nodo existente | Onda expansiva sobre el nodo |
| **Eliminar** | Aplica los 3 casos del BST | Muestra qué caso aplica y anima el reemplazo por el sucesor inorden |
| **Recorridos** | Inorden ascendente y descendente, preorden, postorden y por niveles | Paso a paso con números sobre cada nodo y controles de reproducir, pausar, avanzar y reiniciar |
| **Rebalancear** | Reconstruye el árbol tomando la mediana del recorrido inorden como raíz | Los nodos se desplazan suavemente a su nueva posición |
| **Semilla / Demo PDF / Aleatorio / Vaciar** | Cargan distintos árboles de ejemplo | El árbol crece desde la raíz |
| **Exportar** | Descarga el árbol en JSON o como imagen SVG | — |

**Los 3 casos de eliminación:**

1. **Hoja:** el nodo se elimina directamente.
2. **Un hijo:** el hijo ocupa el lugar del nodo eliminado.
3. **Dos hijos:** el nodo se reemplaza por su **sucesor inorden**, que es el menor del subárbol derecho.

### Ordenamiento (árbol de enteros)

- Agrega números enteros (uno o varios separados por comas).
- **Ejemplo del PDF:** inserta `5, 2, 7, 1, 3, 6, 8` y el recorrido inorden imprime `1 2 3 5 6 7 8`.
- Ordena de forma ascendente o descendente resaltando cada nodo del mini árbol mientras se llenan los resultados.
- Incluye el código de la clase vista en clase, en una sección que se puede desplegar.

### Teoría (interactiva)

- **Glosario interactivo:** al pasar el cursor o hacer clic en una tarjeta se resaltan en el lienzo los nodos que corresponden (por ejemplo, *Hoja* ilumina todas las hojas y *Altura* el camino más largo).
- **Tipos de árboles:** Binario, n-ario, AVL, B, Rojo-negro y de Segmentos, con descripción y uso.
- **Lineal vs jerárquica:** busca el mismo nombre en una lista ordenada y en el árbol, y compara con barras animadas cuántos pasos necesitó cada uno.

### Métricas en vivo

Altura (con la altura mínima posible), peso, orden, raíz, hojas, ramas, mínimo, máximo y un indicador **AVL balanceado: Sí / No** que señala el nodo desbalanceado.

---

## Teoría aplicada

Un **árbol** es una estructura de datos **jerárquica y no lineal**: a diferencia de pilas, colas y listas, cada nodo puede tener uno o más hijos.

| Concepto | Definición |
|---|---|
| **Raíz** | Primer nodo del árbol; no tiene padre |
| **Nodo** | Cada elemento del árbol |
| **Padre** | Nodo que tiene al menos un hijo |
| **Hijo** | Nodo que tiene un padre |
| **Hermano** | Nodos que comparten el mismo padre |
| **Hoja** | Nodo sin hijos, en los extremos del árbol |
| **Rama** | Nodo que no es raíz y tiene al menos un hijo |
| **Altura** | Longitud del camino más largo desde la raíz hasta una hoja |
| **Nivel** | Raíz = 1, hijos = 2, nietos = 3… |
| **Peso** | Número total de nodos, incluyendo raíz y hojas |
| **Orden** | Máximo de hijos que puede tener un nodo (binario = 2) |
| **Grado** | Número de hijos de un nodo dado |

**Colores usados (como en el PDF):** raíz en naranja, ramas en azul claro y hojas en verde.

**Árbol AVL:** es un BST en el que, para cada nodo, la diferencia de alturas entre los subárboles izquierdo y derecho (factor de equilibrio) es como máximo 1. La semilla del proyecto genera a propósito un árbol **sesgado** (`Jhonatan → Andrea → Carlos → Diana → Ivan`) para mostrar un árbol que no es AVL. El botón **Rebalancear** lo corrige.

---

## Backend: `tree.py`

### `Node`
Atributos: `name`, `phone`, `role`, `stack`, `left`, `right`.

### `BinaryTree` (BST ordenado por nombre)
La comparación no distingue mayúsculas de minúsculas. Insertar un nombre repetido actualiza sus datos.

| Método | Descripción |
|---|---|
| `insert` | Inserta o actualiza; devuelve el camino recorrido y las comparaciones |
| `search` | Devuelve los datos, el camino visitado y la lista de comparaciones |
| `delete` | Elimina aplicando los 3 casos (hoja, un hijo, dos hijos con sucesor inorden) |
| `update` | Modifica teléfono, rol o tecnologías |
| `in_order_asc` / `in_order_desc` | Recorrido inorden ascendente y descendente |
| `pre_order` / `post_order` / `level_order` | Preorden, postorden y por niveles (con cola) |
| `height` / `weight` | Altura y peso del árbol |
| `level_of` / `degree_of` / `parent_of` / `siblings_of` | Nivel, grado, padre y hermanos de un nodo |
| `leaves` / `branches` | Lista de hojas y de ramas |
| `min` / `max` | Nodo más a la izquierda y más a la derecha |
| `balance_factor` / `is_avl_balanced` | Factor de equilibrio y verificación AVL |
| `longest_path` | Camino más largo de la raíz a una hoja |
| `rebalance` | Reconstruye el árbol tomando la mediana como raíz |
| `linear_search_steps` | Búsqueda secuencial en la lista ordenada, para comparar pasos |
| `to_dict` | Árbol anidado con nivel, grado, tipo (root/branch/leaf) y factor de equilibrio |
| `clear` | Vacía el árbol |

### `NumberTree` (árbol de enteros)
`add`, `add_recursive`, `in_order_asc`, `in_order_desc`, `to_dict`, `clear`.

---

## Servidor y API: `server.py`

Servidor `http.server` en el puerto **8000**. Sirve la carpeta `static/` y una API JSON. Los errores devuelven JSON con su código HTTP (400, 404, 405, 409, 413).

### GET

| Ruta | Descripción |
|---|---|
| `/api/tree` | Árbol completo y métricas |
| `/api/metrics` | Métricas del árbol |
| `/api/traversal?type=inorder\|inorder_desc\|preorder\|postorder\|levelorder` | Secuencia del recorrido |
| `/api/search?name=Diana` | Resultado de la búsqueda con el camino y las comparaciones |
| `/api/compare?name=Ivan` | Pasos en la lista ordenada frente a pasos en el árbol |
| `/api/longest_path` | Camino más largo |
| `/api/numbers/sorted?order=asc\|desc` | Árbol de enteros ordenado |

### POST (cuerpo JSON)

| Ruta | Cuerpo | Descripción |
|---|---|---|
| `/api/insert` | `{name, phone, role, stack}` | Insertar o actualizar |
| `/api/update` | `{name, phone?, role?, stack?}` | Actualizar datos |
| `/api/delete` | `{name}` | Eliminar |
| `/api/seed` | — | Cargar la semilla |
| `/api/demo_perfect` | — | Árbol perfecto A–O del PDF |
| `/api/random` | `{count}` | N desarrolladores aleatorios (1 a 60) |
| `/api/rebalance` | — | Rebalancear |
| `/api/clear` | — | Vaciar |
| `/api/numbers/add` | `{values: [..]}` | Agregar enteros |
| `/api/numbers/example` | — | Cargar 5, 2, 7, 1, 3, 6, 8 |
| `/api/numbers/clear` | — | Vaciar el árbol de enteros |

Ejemplo:

```bash
curl -s localhost:8000/api/metrics
curl -s -X POST localhost:8000/api/insert -H "Content-Type: application/json" \
     -d '{"name":"Mariana","phone":"310-555-0199","role":"Data","stack":["SQL"]}'
```

---

## Frontend

HTML, CSS y JavaScript puros, sin frameworks, CDN ni proceso de compilación.

- **Diseño:** tema oscuro (por defecto) y claro, con fondo de aurora animado y paneles de vidrio esmerilado.
- **Lienzo SVG:** nodos con degradados y brillo, aristas curvas con partículas que fluyen de padre a hijo y franjas que marcan cada nivel ("Nivel 1…n").
- **Navegación:** arrastrar para mover, rueda o botones para el zoom, ajuste a pantalla y minimapa.
- **Inspector:** al seleccionar un nodo muestra iniciales, teléfono, rol, tecnologías, nivel, grado, padre, hermanos, hijos, factor de equilibrio y tipo, con botones **Editar** y **Eliminar**.
- **Registro de operaciones:** historial legible de cada operación, con la ruta seguida (`raíz → izquierda → encontrado`) y la secuencia de los recorridos.
- **Accesibilidad:** etiquetas `aria`, navegación por teclado, anillos de foco y soporte para movimiento reducido.
- **Adaptable:** en pantallas pequeñas el panel lateral se convierte en una hoja inferior.

---

## Datos de ejemplo

**Semilla**, insertada en este orden:

| Nombre | Teléfono | Rol | Tecnologías |
|---|---|---|---|
| Jhonatan | 111-1111 | Backend | Python, Django |
| Andrea | 222-2222 | Frontend | React, TypeScript |
| Carlos | 333-3333 | DevOps | Docker, Kubernetes |
| Diana | 444-4444 | Data | SQL, Pandas |
| Ivan | 555-5555 | QA | Selenium, Pytest |
| Camila | 310-555-0101 | Mobile | Flutter, Dart |
| Mateo | 311-482-7720 | Backend | Node.js, Express |
| Sofia | 312-903-4415 | Frontend | Vue, Tailwind |
| Lucas | 313-276-9034 | DevOps | AWS, Terraform |
| Valentina | 314-650-1187 | Data | Python, Spark |
| Daniel | 315-118-6602 | Mobile | Kotlin, Android |
| Laura | 316-742-3359 | QA | Cypress, Playwright |
| Andres | 317-095-8841 | Backend | Java, Spring |
| Paula | 318-367-2290 | Frontend | Angular, RxJS |
| Sebastian | 319-824-5573 | Data | PostgreSQL, Power BI |

Resultado: peso 15, altura 5 (la mínima posible es 4), 6 hojas, 8 ramas y **no es AVL** (desbalance en Andrea).

**Demo del PDF:** letras insertadas en el orden `H, D, L, B, F, J, N, A, C, E, G, I, K, M, O`, que forman un árbol binario perfecto de 4 niveles y peso 15.

**Números:** `5, 2, 7, 1, 3, 6, 8`, cuyo recorrido inorden da `1 2 3 5 6 7 8`.

---

## Atajos de teclado

| Tecla | Acción |
|---|---|
| `/` | Buscar |
| `i` | Insertar |
| `d` | Eliminar |
| `Espacio` | Reproducir o pausar el recorrido |
| `f` | Ajustar el árbol a la pantalla |
| `t` | Cambiar entre tema claro y oscuro |
| `+` / `-` | Zoom |
| `Esc` | Quitar la selección |

---

## Tecnologías

- **Backend:** Python 3 (solo biblioteca estándar: `http.server`, `json`, `urllib`, `random`, `re`, `threading`, `collections`)
- **Frontend:** HTML5, CSS3 (variables, animaciones, `backdrop-filter`) y JavaScript (ES2020), con SVG para el dibujo del árbol

---

**Curso:** Estructuras de Datos, Cuarto Semestre, Universidad Cooperativa de Colombia.
