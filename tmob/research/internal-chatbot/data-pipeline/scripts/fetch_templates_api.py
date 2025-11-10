#!/usr/bin/env python3
"""
Fetch and process T-Mobile Developer Toolbox templates from API.
"""

import json
import sys
from pathlib import Path
from typing import List

# Add parent directory to path
sys.path.append(str(Path(__file__).parent.parent.parent))

from langchain.schema import Document


def load_api_response(file_path: str) -> List[dict]:
    """Load API response from JSON file."""
    with open(file_path, 'r') as f:
        return json.load(f)


def process_template(template: dict) -> Document:
    """
    Convert a template object into a searchable document.
    
    Args:
        template: Template dictionary from API
        
    Returns:
        Document object for vector store
    """
    # Build comprehensive text content
    content_parts = [
        f"Template: {template['displayName']}",
        f"Template Name: {template['templateName']}",
        f"Description: {template['description']}",
        f"Category: {template['category']}",
        f"Platform: {template['platformType']}",
        f"Technology: {template['tech']}",
        f"Build Tool: {template['buildTech']}",
        ""
    ]
    
    # Add optional fields
    if template.get('templateVersion'):
        content_parts.insert(-1, f"Version: {template['templateVersion']}")
    if template.get('authorName'):
        content_parts.insert(-1, f"Author: {template['authorName']}")
    
    # Add prerequisites
    if template.get('preRequisites'):
        content_parts.append("Prerequisites:")
        for prereq in template['preRequisites']:
            content_parts.append(f"  - {prereq}")
        content_parts.append("")
    
    # Add output components
    if template.get('outputComponents'):
        content_parts.append("Output Components:")
        for component in template['outputComponents']:
            content_parts.append(f"  - {component}")
        content_parts.append("")
    
    # Add tags
    if template.get('tags'):
        content_parts.append(f"Tags: {', '.join(template['tags'])}")
        content_parts.append("")
    
    # Add author contact
    if template.get('authorContact'):
        content_parts.append("Support:")
        for contact in template['authorContact']:
            if contact['contactType'] == 'slack':
                content_parts.append(f"  - Slack: {contact['value']}")
            elif contact['contactType'] == 'email':
                content_parts.append(f"  - Email: {contact['value']}")
        content_parts.append("")
    
    # Add key fields information
    if template.get('fields'):
        content_parts.append("Configuration Fields:")
        for field in template['fields'][:5]:  # First 5 fields
            content_parts.append(f"  - {field['displayName']}: {field['description']}")
    
    content = "\n".join(content_parts)
    
    # Create metadata
    metadata = {
        "source": "developer_toolbox_api",
        "template_id": template['id'],
        "template_name": template['templateName'],
        "display_name": template['displayName'],
        "category": template['category'],
        "platform_type": template['platformType'],
        "tech": template['tech'],
        "lifecycle_stage": template['templateLifeCycleStage'],
        "documentation_url": template.get('documentationUrl', ''),
        "type": "template"
    }
    
    return Document(
        page_content=content,
        metadata=metadata
    )


def main():
    """Main function to process API data."""
    print("Processing T-Mobile Developer Toolbox Templates...")
    
    # You can either:
    # 1. Save the API response to a file and load it
    # 2. Fetch it directly from the API
    
    # For now, let's assume you save the API response as templates.json
    api_response_file = Path(__file__).parent.parent / "sample_data" / "templates.json"
    
    if not api_response_file.exists():
        print(f"Error: {api_response_file} not found!")
        print("Please save the API response as templates.json in data-pipeline/sample_data/")
        return
    
    # Load API response
    templates = load_api_response(api_response_file)
    print(f"Loaded {len(templates)} templates")
    
    # Process each template
    documents = []
    for template in templates:
        doc = process_template(template)
        documents.append(doc)
    
    print(f"Created {len(documents)} documents")
    
    # Save to JSON for loading into vector store
    output_file = Path(__file__).parent.parent / "processed_templates.json"
    output_data = [
        {
            "content": doc.page_content,
            "metadata": doc.metadata
        }
        for doc in documents
    ]
    
    with open(output_file, 'w') as f:
        json.dump(output_data, f, indent=2)
    
    print(f"\nSaved processed documents to: {output_file}")
    print("\nNext steps:")
    print("1. Load into vector store:")
    print(f"   python scripts/load_to_vectorstore.py --input {output_file}")


if __name__ == "__main__":
    main()
