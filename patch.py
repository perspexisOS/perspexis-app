import re

with open("src/App.jsx", "r") as f:
    code = f.read()

# 1. Fonts → Space Grotesk + Inter
code = code.replace(
    "'Plus Jakarta Sans', sans-serif",
    "'Space Grotesk', sans-serif"
)
code = code.replace(
    "'DM Sans', sans-serif",
    "'Inter', sans-serif"
)

# 2. Google Fonts imports (all occurrences)
old_import = "https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700&family=DM+Sans:ital,wght@0,400;0,500;0,600&family=DM+Mono:wght@400;500&display=swap"
new_import = "https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=Inter:wght@400;500;600&family=DM+Mono:wght@400;500&display=swap"
code = code.replace(old_import, new_import)

# Also catch the DM+Sans variant without ital
old_import2 = "https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700&family=DM+Sans:wght@400;500;600&family=DM+Mono:wght@400;500&display=swap"
code = code.replace(old_import2, new_import)

# 3. Onboarding logo: 48px → 200px
code = code.replace(
    'style={{ width: 48, height: 48, objectFit: "contain", marginBottom: 12 }}',
    'style={{ width: 200, height: "auto", objectFit: "contain", marginBottom: 12 }}'
)

# 4. Beta whitelist — add new email
code = code.replace(
    '"mike@advisiopartners.com",\n  ];',
    '"mike@advisiopartners.com",\n    // Advisio Digital Partners\n    "advisiodigitalpartners@gmail.com",\n  ];'
)

with open("src/App.jsx", "w") as f:
    f.write(code)

print("Done. All 4 changes applied.")
