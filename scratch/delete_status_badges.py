import sys

def delete_lines(file_path, line_ranges):
    with open(file_path, 'r') as f:
        lines = f.readlines()
    
    # Sort ranges in reverse to avoid index shifting
    line_ranges.sort(reverse=True)
    
    for start, end in line_ranges:
        # Subtract 1 for 0-based indexing
        del lines[start-1:end]
        
    with open(file_path, 'w') as f:
        f.writelines(lines)

if __name__ == "__main__":
    file_path = "/Users/firozmohammad/Work/Ai_social/backend/src/app/admin/(dashboard)/service-configs/ExternalServiceManagement.tsx"
    # Ensure these ranges are correct based on the latest view_file
    delete_lines(file_path, [(1084, 1091), (1143, 1150)])
    print("Lines deleted successfully.")
