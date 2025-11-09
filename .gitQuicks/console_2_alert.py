#!/usr/bin/env python3
"""
HOW TO RUN:
1. Save this file as console_2_alerts.py
2. Open terminal and navigate to the file location
3. Run: python3 console_2_alerts.py
4. Paste your console.log statement when prompted
5. Choose conversion type (a for alerts.add, d for alerts.debug)
6. Copy the converted output

QUICK TEST:
python3 console_2_alerts.py "console.log('test:', variable)"

Converts console.log statements to alerts.add or alerts.debug calls with template literal formatting.
Handles variable interpolation by converting from + concatenation to ${} syntax.
"""

import re
import sys

def convert_console_to_debug(input_string):
    """
    Convert console.log statements to alerts.debug format.
    
    Args:
        input_string (str): The console.log statement to convert
        
    Returns:
        str: Converted alerts.debug statement
    """
    # Remove leading/trailing whitespace and quotes
    cleaned = input_string.strip().strip('"\'')
    
    # Extract the content inside console.log()
    console_match = re.match(r'console\.log\s*\(\s*(.*)\s*\)$', cleaned)
    if not console_match:
        raise ValueError("Input is not a valid console.log statement")
    
    content = console_match.group(1)
    
    # Parse the content to handle string concatenation and variables
    converted_content = parse_log_content(content)
    
    # Format as alerts.debug with template literal and logId
    result = f'alerts.debug(`{converted_content}`, logId)'
    
    return result

def convert_console_to_alerts(input_string):
    """
    Convert console.log statements to alerts.add format.
    
    Args:
        input_string (str): The console.log statement to convert
        
    Returns:
        str: Converted alerts.add statement
    """
    # Remove leading/trailing whitespace and quotes
    cleaned = input_string.strip().strip('"\'')
    
    # Extract the content inside console.log()
    console_match = re.match(r'console\.log\s*\(\s*(.*)\s*\)$', cleaned)
    if not console_match:
        raise ValueError("Input is not a valid console.log statement")
    
    content = console_match.group(1)
    
    # Parse the content to handle string concatenation and variables
    converted_content = parse_log_content(content)
    
    # Format as alerts.add with template literal and severity level
    result = f'alerts.add(`{converted_content}`, 2)'
    
    return result

def parse_log_content(content):
    """
    Parse console.log content and convert to template literal format.
    Handles string concatenation with + operator and converts variables to ${var} syntax.
    """
    # Split by + operator while preserving quoted strings
    parts = split_preserving_quotes(content)
    
    result_parts = []
    
    for part in parts:
        part = part.strip()
        
        # If it's a quoted string, remove quotes and add to result
        if (part.startswith("'") and part.endswith("'")) or (part.startswith('"') and part.endswith('"')):
            # Remove outer quotes and escape any backticks
            string_content = part[1:-1].replace('`', '\\`')
            result_parts.append(string_content)
        else:
            # It's a variable - wrap in ${}
            result_parts.append(f'${{{part}}}')
    
    return ''.join(result_parts)

def split_preserving_quotes(text):
    """
    Split text by + operator while preserving content inside quotes.
    """
    parts = []
    current_part = ""
    in_quotes = False
    quote_char = None
    i = 0
    
    while i < len(text):
        char = text[i]
        
        if not in_quotes and char in ['"', "'"]:
            in_quotes = True
            quote_char = char
            current_part += char
        elif in_quotes and char == quote_char:
            # Check if it's escaped
            if i > 0 and text[i-1] == '\\':
                current_part += char
            else:
                in_quotes = False
                quote_char = None
                current_part += char
        elif not in_quotes and char == '+':
            # Found a separator
            if current_part.strip():
                parts.append(current_part.strip())
            current_part = ""
        else:
            current_part += char
        
        i += 1
    
    # Add the last part
    if current_part.strip():
        parts.append(current_part.strip())
    
    return parts

def get_conversion_choice():
    """
    Ask user to choose between alerts.add or alerts.debug conversion.
    
    Returns:
        str: 'a' for alerts.add, 'd' for alerts.debug
    """
    while True:
        print("\n🔄 Choose conversion type:")
        print("  (a) alerts.add - for general logging")
        print("  (d) alerts.debug - for debug logging")
        choice = input("→ Enter 'a' or 'd': ").strip().lower()
        
        if choice in ['a', 'd']:
            return choice
        else:
            print("❌ Please enter 'a' for alerts.add or 'd' for alerts.debug")

def interactive_converter():
    """
    Interactive terminal converter with continuous operation.
    """
    print("🔄 Console.log → alerts Converter")
    print("=" * 40)
    print("• Paste your console.log statement and press Enter")
    print("• Choose conversion type when prompted")
    print("• Type 'quit', 'exit', or 'q' to stop")
    print("• Type 'test' to see example conversion")
    print("=" * 40)
    
    while True:
        try:
            # Get input with a clear prompt
            print("\n📥 Paste console.log statement:")
            user_input = input("→ ").strip()
            
            # Handle exit commands
            if user_input.lower() in ['quit', 'exit', 'q', '']:
                print("👋 Goodbye!")
                break
            
            # Handle test command
            if user_input.lower() == 'test':
                test_input = "console.log('Room-edit: Adding last_updated timestamp to update data:', updateData.last_updated)"
                print(f"\n📝 Test Input:\n{test_input}")
                
                # Show both conversion options for test
                result_add = convert_console_to_alerts(test_input)
                result_debug = convert_console_to_debug(test_input)
                
                print(f"\n✅ alerts.add Output:\n{result_add}")
                print(f"\n✅ alerts.debug Output:\n{result_debug}")
                continue
            
            # Get conversion choice
            choice = get_conversion_choice()
            
            # Process the conversion based on choice
            if choice == 'a':
                result = convert_console_to_alerts(user_input)
                conversion_type = "alerts.add"
            else:
                result = convert_console_to_debug(user_input)
                conversion_type = "alerts.debug"
            
            # Display result with clear formatting
            print(f"\n✅ Converted to {conversion_type}:")
            print(f"{result}")
            
            # Copy to clipboard hint
            print(f"\n💡 Tip: Select the output above to copy")
            
        except ValueError as e:
            print(f"\n❌ Error: {e}")
            print("💡 Make sure your input starts with 'console.log('")
        except KeyboardInterrupt:
            print("\n\n👋 Goodbye!")
            break
        except Exception as e:
            print(f"\n❌ Unexpected error: {e}")
            print("💡 Please try again with a valid console.log statement")

def main():
    """
    Main function to handle command line input or interactive mode.
    """
    if len(sys.argv) > 1:
        # Command line argument provided - use alerts.add as default
        input_string = sys.argv[1]
        try:
            result = convert_console_to_alerts(input_string)
            print(result)
        except ValueError as e:
            print(f"Error: {e}", file=sys.stderr)
            sys.exit(1)
        except Exception as e:
            print(f"Unexpected error: {e}", file=sys.stderr)
            sys.exit(1)
    else:
        # Interactive mode
        interactive_converter()

if __name__ == "__main__":
    main()