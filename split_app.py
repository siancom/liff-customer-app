import os
import re

app_path = 'src/App.jsx'
with open(app_path, 'r', encoding='utf-8') as f:
    content = f.read()

# I will write a simple python script to split it, but it might be too complex to get right on the first try.
