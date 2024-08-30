import re

def process_onclicks(file_path):
    with open(file_path, 'r') as file:
        lines = file.readlines()

    with open(file_path, 'w') as file:
        for i, line in enumerate(lines):
            if 'onclick="' in line:
                # Match the entire onclick attribute safely, even if it contains embedded quotes
                onclick_match = re.search(r'onclick="([^"]*)"', line)
                if onclick_match:
                    onclick_content = onclick_match.group(1)

                    # Check if handleHaptics() is already at the end
                    if not onclick_content.strip().endswith('handleHaptics()'):
                        # Ensure no semicolons or spaces before adding handleHaptics()
                        new_onclick_content = onclick_content.rstrip('; ') + ';handleHaptics()'
                        # Replace the entire onclick attribute content
                        line = line.replace(onclick_match.group(1), new_onclick_content)
                        print(f"Line {i+1}: updated onclick to end with handleHaptics")

            file.write(line)

# Usage
process_onclicks('emoji.js')