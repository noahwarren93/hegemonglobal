#!/bin/bash

echo "FILE SIZE REPORT:"
echo "================\n"

echo "JavaScript Files:"
echo "-----------------"
for file in js/*.js; do
  size=$(ls -lh "$file" | awk '{print $5}')
  filename=$(basename "$file")
  printf "%-25s %8s\n" "$filename" "$size"
done

echo ""
echo "CSS Files:"
echo "----------"
for file in css/*.css; do
  size=$(ls -lh "$file" | awk '{print $5}')
  filename=$(basename "$file")
  printf "%-25s %8s\n" "$filename" "$size"
done

echo ""
echo "Summary Statistics:"
echo "-------------------"

js_total=$(du -ch js/*.js | tail -1 | awk '{print $1}')
css_total=$(du -ch css/*.css | tail -1 | awk '{print $1}')
html_size=$(ls -lh index.html | awk '{print $5}')

echo "JavaScript Total: $js_total"
echo "CSS Total:       $css_total"
echo "HTML Size:       $html_size"

echo ""
echo "Largest Files (by type):"
echo "------------------------"
echo "JS:  $(ls -lhS js/*.js | head -1 | awk '{print $9, "(" $5 ")"}')"
echo "CSS: $(ls -lhS css/*.css | head -1 | awk '{print $9, "(" $5 ")"}')"
