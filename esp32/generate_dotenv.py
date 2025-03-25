
with open(".env") as f:
    lines = f.readlines()

with open("include/dotenv.h", "w") as f:
    f.write("// Auto-generated from .env\n#pragma once\n\n")
    for line in lines:
        if "=" in line:
            key, value = line.strip().split("=", 1)
            f.write(f'#define {key} "{value}"\n')
