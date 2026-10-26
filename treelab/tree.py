import random
from collections import deque

ORDER = 2

ROLES = ["Backend", "Frontend", "DevOps", "Data", "QA", "Mobile"]

ROLE_STACKS = {
    "Backend": ["Python", "Django", "Node.js", "Express", "Java", "Spring", "Go", "FastAPI"],
    "Frontend": ["React", "TypeScript", "Vue", "Angular", "Svelte", "Tailwind"],
    "DevOps": ["Docker", "Kubernetes", "AWS", "Terraform", "GitHub Actions", "Linux"],
    "Data": ["SQL", "Pandas", "Spark", "PostgreSQL", "Power BI", "Airflow"],
    "QA": ["Selenium", "Pytest", "Cypress", "Playwright", "Jest", "Postman"],
    "Mobile": ["Flutter", "Dart", "Kotlin", "Swift", "React Native", "Firebase"],
}

SEED_DEVELOPERS = [
    ("Jhonatan", "111-1111", "Backend", ["Python", "Django"]),
    ("Andrea", "222-2222", "Frontend", ["React", "TypeScript"]),
    ("Carlos", "333-3333", "DevOps", ["Docker", "Kubernetes"]),
    ("Diana", "444-4444", "Data", ["SQL", "Pandas"]),
    ("Ivan", "555-5555", "QA", ["Selenium", "Pytest"]),
    ("Camila", "310-555-0101", "Mobile", ["Flutter", "Dart"]),
    ("Mateo", "311-482-7720", "Backend", ["Node.js", "Express"]),
    ("Sofia", "312-903-4415", "Frontend", ["Vue", "Tailwind"]),
    ("Lucas", "313-276-9034", "DevOps", ["AWS", "Terraform"]),
    ("Valentina", "314-650-1187", "Data", ["Python", "Spark"]),
    ("Daniel", "315-118-6602", "Mobile", ["Kotlin", "Android"]),
    ("Laura", "316-742-3359", "QA", ["Cypress", "Playwright"]),
    ("Andres", "317-095-8841", "Backend", ["Java", "Spring"]),
    ("Paula", "318-367-2290", "Frontend", ["Angular", "RxJS"]),
    ("Sebastian", "319-824-5573", "Data", ["PostgreSQL", "Power BI"]),
]

PERFECT_ORDER = ["H", "D", "L", "B", "F", "J", "N", "A", "C", "E", "G", "I", "K", "M", "O"]

PERFECT_DEMO = [
    (letter, f"300-555-{index + 1:04d}", "Demo", ["Árbol perfecto"])
    for index, letter in enumerate(PERFECT_ORDER)
]

NUMBERS_EXAMPLE = [5, 2, 7, 1, 3, 6, 8]

FIRST_NAMES = [
    "Alejandro", "Natalia", "Santiago", "Mariana", "Juan", "Daniela", "Felipe", "Isabella",
    "Nicolas", "Gabriela", "Samuel", "Juliana", "Tomas", "Manuela", "David", "Carolina",
    "Esteban", "Luisa", "Miguel", "Sara", "Emilio", "Antonia", "Julian", "Catalina",
    "Kevin", "Melissa", "Brayan", "Yesenia", "Oscar", "Lina",
]

LAST_NAMES = [
    "Rodriguez", "Gomez", "Martinez", "Lopez", "Herrera", "Castro", "Vargas", "Rojas",
    "Moreno", "Jimenez", "Ortiz", "Pineda", "Quintero", "Zapata", "Benitez", "Nunez",
    "Ospina", "Yepes", "Arango", "Escobar",
]


def compare_key(name):
    return " ".join(str(name).split()).lower()


def random_developers(count, rng=random):
    rows = []
    used = set()
    while len(rows) < count:
        name = f"{rng.choice(FIRST_NAMES)} {rng.choice(LAST_NAMES)[0]}."
        key = compare_key(name)
        if key in used:
            continue
        used.add(key)
        role = rng.choice(ROLES)
        stack = rng.sample(ROLE_STACKS[role], 2)
        phone = f"3{rng.randint(0, 2)}{rng.randint(0, 9)}-{rng.randint(100, 999)}-{rng.randint(1000, 9999)}"
        rows.append((name, phone, role, stack))
    return rows


class Node:
    def __init__(self, name, phone, role="", stack=None, left=None, right=None):
        self.name = name
        self.phone = phone
        self.role = role
        self.stack = list(stack or [])
        self.left = left
        self.right = right

    def children(self):
        return [child for child in (self.left, self.right) if child is not None]

    def data(self):
        return {"name": self.name, "phone": self.phone, "role": self.role, "stack": list(self.stack)}


class BinaryTree:
    order = ORDER

    def __init__(self):
        self.root = None

    def clear(self):
        self.root = None

    def _walk(self, name):
        key = compare_key(name)
        parent = None
        current = self.root
        comparisons = []
        directions = ["root"]
        while current is not None:
            current_key = compare_key(current.name)
            if key == current_key:
                comparisons.append({"node": current.name, "relation": "=", "direction": "found"})
                directions.append("found")
                return current, parent, comparisons, directions
            if key < current_key:
                comparisons.append({"node": current.name, "relation": "<", "direction": "left"})
                directions.append("left")
                parent, current = current, current.left
            else:
                comparisons.append({"node": current.name, "relation": ">", "direction": "right"})
                directions.append("right")
                parent, current = current, current.right
        directions.append("not_found")
        return None, parent, comparisons, directions

    def _find(self, name):
        node, parent, _, _ = self._walk(name)
        return node, parent

    def insert(self, name, phone, role="", stack=None):
        node, parent, comparisons, directions = self._walk(name)
        path = [step["node"] for step in comparisons]
        if node is not None:
            node.phone = phone
            if role:
                node.role = role
            if stack:
                node.stack = list(stack)
            directions[-1] = "updated"
            return {"action": "updated", "name": node.name, "parent": parent.name if parent else None,
                    "side": None, "level": len(comparisons), "path": path,
                    "comparisons": comparisons, "directions": directions}
        new_node = Node(name, phone, role, stack)
        side = None
        if parent is None:
            self.root = new_node
        elif compare_key(name) < compare_key(parent.name):
            parent.left = new_node
            side = "left"
        else:
            parent.right = new_node
            side = "right"
        directions[-1] = "inserted"
        return {"action": "created", "name": name, "parent": parent.name if parent else None,
                "side": side, "level": len(comparisons) + 1, "path": path,
                "comparisons": comparisons, "directions": directions}

    def search(self, name):
        node, _, comparisons, directions = self._walk(name)
        return {"found": node is not None, "data": node.data() if node else None,
                "path": [step["node"] for step in comparisons], "comparisons": comparisons,
                "directions": directions, "steps": len(comparisons)}

    def update(self, name, phone=None, role=None, stack=None):
        node, _ = self._find(name)
        if node is None:
            return None
        if phone is not None:
            node.phone = phone
        if role is not None:
            node.role = role
        if stack is not None:
            node.stack = list(stack)
        return node.data()

    def _replace_child(self, parent, node, child):
        if parent is None:
            self.root = child
        elif parent.left is node:
            parent.left = child
        else:
            parent.right = child

    def delete(self, name):
        node, parent, comparisons, directions = self._walk(name)
        if node is None:
            return None
        directions[-1] = "deleted"
        result = {"name": node.name, "parent": parent.name if parent else None,
                  "path": [step["node"] for step in comparisons], "comparisons": comparisons,
                  "directions": directions, "successor": None, "successor_path": [], "child": None}
        if node.left is not None and node.right is not None:
            successor_parent = node
            successor = node.right
            successor_path = [successor.name]
            while successor.left is not None:
                successor_parent, successor = successor, successor.left
                successor_path.append(successor.name)
            result["case"] = "two_children"
            result["successor"] = successor.name
            result["successor_path"] = successor_path
            node.name, node.phone, node.role, node.stack = successor.name, successor.phone, successor.role, successor.stack
            if successor_parent is node:
                successor_parent.right = successor.right
            else:
                successor_parent.left = successor.right
        else:
            child = node.left if node.left is not None else node.right
            result["case"] = "leaf" if child is None else "one_child"
            result["child"] = child.name if child else None
            self._replace_child(parent, node, child)
        return result

    def _in_order(self, node, result):
        if node is not None:
            self._in_order(node.left, result)
            result.append(node)
            self._in_order(node.right, result)

    def _nodes_in_order(self):
        result = []
        self._in_order(self.root, result)
        return result

    def in_order_asc(self):
        return [node.name for node in self._nodes_in_order()]

    def in_order_desc(self):
        result = []

        def visit(node):
            if node is not None:
                visit(node.right)
                result.append(node.name)
                visit(node.left)

        visit(self.root)
        return result

    def pre_order(self):
        result = []

        def visit(node):
            if node is not None:
                result.append(node.name)
                visit(node.left)
                visit(node.right)

        visit(self.root)
        return result

    def post_order(self):
        result = []

        def visit(node):
            if node is not None:
                visit(node.left)
                visit(node.right)
                result.append(node.name)

        visit(self.root)
        return result

    def level_order(self):
        result = []
        queue = deque([self.root] if self.root else [])
        while queue:
            node = queue.popleft()
            result.append(node.name)
            queue.extend(node.children())
        return result

    def _height(self, node):
        if node is None:
            return 0
        return 1 + max(self._height(node.left), self._height(node.right))

    def height(self):
        return self._height(self.root)

    def weight(self):
        return len(self._nodes_in_order())

    def level_of(self, name):
        node, _, comparisons, _ = self._walk(name)
        return len(comparisons) if node else None

    def degree_of(self, name):
        node, _ = self._find(name)
        return len(node.children()) if node else None

    def parent_of(self, name):
        node, parent = self._find(name)
        return parent.name if node and parent else None

    def siblings_of(self, name):
        node, parent = self._find(name)
        if node is None or parent is None:
            return []
        return [child.name for child in parent.children() if child is not node]

    def leaves(self):
        return [node.name for node in self._nodes_in_order() if not node.children()]

    def branches(self):
        return [node.name for node in self._nodes_in_order() if node is not self.root and node.children()]

    def min(self):
        node = self.root
        while node is not None and node.left is not None:
            node = node.left
        return node.name if node else None

    def max(self):
        node = self.root
        while node is not None and node.right is not None:
            node = node.right
        return node.name if node else None

    def balance_factor(self, node):
        return self._height(node.left) - self._height(node.right) if node else 0

    def balance_factors(self):
        return {node.name: self.balance_factor(node) for node in self._nodes_in_order()}

    def is_avl_balanced(self):
        unbalanced = []

        def check(node):
            if node is None:
                return 0
            left = check(node.left)
            right = check(node.right)
            if abs(left - right) > 1 and not unbalanced:
                unbalanced.append(node.name)
            return 1 + max(left, right)

        check(self.root)
        return {"balanced": not unbalanced, "unbalanced": unbalanced[0] if unbalanced else None}

    def longest_path(self):
        path = []
        node = self.root
        while node is not None:
            path.append(node.name)
            if not node.children():
                break
            node = node.left if self._height(node.left) >= self._height(node.right) else node.right
        return path

    def rebalance(self):
        ordered = [node.data() for node in self._nodes_in_order()]

        def build(low, high):
            if low > high:
                return None
            middle = (low + high) // 2
            item = ordered[middle]
            node = Node(item["name"], item["phone"], item["role"], item["stack"])
            node.left = build(low, middle - 1)
            node.right = build(middle + 1, high)
            return node

        self.root = build(0, len(ordered) - 1)
        return self.height()

    def _to_dict(self, node, level):
        if node is None:
            return None, 0
        left, left_height = self._to_dict(node.left, level + 1)
        right, right_height = self._to_dict(node.right, level + 1)
        if node is self.root:
            kind = "root"
        elif node.children():
            kind = "branch"
        else:
            kind = "leaf"
        height = 1 + max(left_height, right_height)
        item = node.data()
        item.update({"level": level, "degree": len(node.children()), "type": kind,
                     "balance_factor": left_height - right_height, "height": height,
                     "left": left, "right": right})
        return item, height

    def to_dict(self):
        return self._to_dict(self.root, 1)[0]

    def linear_search_steps(self, name):
        key = compare_key(name)
        sequence = []
        for item in self.in_order_asc():
            sequence.append(item)
            if compare_key(item) == key:
                return {"steps": len(sequence), "found": True, "sequence": sequence}
        return {"steps": len(sequence), "found": False, "sequence": sequence}

    def metrics(self):
        height = self.height()
        avl = self.is_avl_balanced()
        leaves = self.leaves()
        branches = self.branches()
        return {"empty": self.root is None, "height": height, "height_edges": max(height - 1, 0),
                "levels": height, "weight": self.weight(), "order": ORDER,
                "root": self.root.name if self.root else None,
                "leaves": leaves, "branches": branches,
                "leaf_count": len(leaves), "branch_count": len(branches),
                "min": self.min(), "max": self.max(),
                "avl_balanced": avl["balanced"], "unbalanced_node": avl["unbalanced"],
                "longest_path": self.longest_path()}


class NumberNode:
    def __init__(self, value, uid):
        self.value = value
        self.id = uid
        self.left = None
        self.right = None


class NumberTree:
    def __init__(self):
        self.root = None
        self.insertion = []
        self._next_id = 1

    def clear(self):
        self.root = None
        self.insertion = []
        self._next_id = 1

    def add(self, value):
        node = NumberNode(value, self._next_id)
        self._next_id += 1
        self.insertion.append(value)
        if self.root is None:
            self.root = node
        else:
            self.add_recursive(self.root, node)
        return node.id

    def add_recursive(self, current, node):
        if node.value < current.value:
            if current.left is None:
                current.left = node
            else:
                self.add_recursive(current.left, node)
        else:
            if current.right is None:
                current.right = node
            else:
                self.add_recursive(current.right, node)

    def in_order_asc(self):
        result = []

        def visit(node):
            if node is not None:
                visit(node.left)
                result.append({"id": node.id, "value": node.value})
                visit(node.right)

        visit(self.root)
        return result

    def in_order_desc(self):
        result = []

        def visit(node):
            if node is not None:
                visit(node.right)
                result.append({"id": node.id, "value": node.value})
                visit(node.left)

        visit(self.root)
        return result

    def count(self):
        return len(self.insertion)

    def _to_dict(self, node, level):
        if node is None:
            return None
        has_children = node.left is not None or node.right is not None
        kind = "root" if node is self.root else ("branch" if has_children else "leaf")
        return {"id": node.id, "value": node.value, "level": level, "type": kind,
                "left": self._to_dict(node.left, level + 1),
                "right": self._to_dict(node.right, level + 1)}

    def to_dict(self):
        return self._to_dict(self.root, 1)
