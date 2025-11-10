"""
Template Information Service
Provides comprehensive information about available project templates
"""

from typing import List, Dict, Any
import json
import os
from app.utils.logger import setup_logger

logger = setup_logger(__name__)

class TemplateInfoService:
    """Service to provide information about available project templates"""
    
    def __init__(self):
        self.templates_data = self._load_templates_data()
        logger.info("Template information service initialized")
    
    def _load_templates_data(self) -> Dict[str, Any]:
        """Load template data from various sources"""
        templates = {
            "available_templates": [],
            "template_details": {},
            "platforms": [],
            "technologies": []
        }
        
        try:
            # Load from templates.json if exists
            templates_json_path = os.path.join(
                os.path.dirname(__file__), 
                "../../../data-pipeline/sample_data/templates.json"
            )
            
            if os.path.exists(templates_json_path):
                with open(templates_json_path, 'r') as f:
                    json_data = json.load(f)
                    
                for template in json_data:
                    template_info = {
                        "id": template.get("id"),
                        "name": template.get("templateName"),
                        "display_name": template.get("displayName"),
                        "description": template.get("description"),
                        "technology": template.get("tech"),
                        "build_tech": template.get("buildTech"),
                        "platform": template.get("platformType"),
                        "category": template.get("category"),
                        "prerequisites": template.get("preRequisites", []),
                        "tags": template.get("tags", [])
                    }
                    
                    templates["available_templates"].append(template_info)
                    templates["template_details"][template.get("templateName")] = template_info
                    
                    # Collect unique platforms and technologies
                    if template.get("platformType") not in templates["platforms"]:
                        templates["platforms"].append(template.get("platformType"))
                    
                    if template.get("tech") not in templates["technologies"]:
                        templates["technologies"].append(template.get("tech"))
            
            logger.info(f"Loaded {len(templates['available_templates'])} templates")
            return templates
            
        except Exception as e:
            logger.error(f"Error loading template data: {str(e)}")
            return templates
    
    def get_all_templates_summary(self) -> str:
        """Get a formatted summary of all available templates"""
        
        if not self.templates_data["available_templates"]:
            return "No templates are currently available. Please check with your administrator."
        
        summary = "🚀 **Available Project Templates**\n\n"
        summary += f"I can help you create {len(self.templates_data['available_templates'])} different types of projects:\n\n"
        
        # Group by platform
        platforms = {}
        for template in self.templates_data["available_templates"]:
            platform = template["platform"] or "Other"
            if platform not in platforms:
                platforms[platform] = []
            platforms[platform].append(template)
        
        for platform, templates in platforms.items():
            summary += f"## 🏗️ {platform} Platform\n\n"
            
            for template in templates:
                summary += f"### {template['display_name']}\n"
                summary += f"- **Technology**: {template['technology']}\n"
                summary += f"- **Build Tool**: {template['build_tech']}\n"
                summary += f"- **Category**: {template['category']}\n"
                summary += f"- **Description**: {template['description']}\n"
                
                if template['prerequisites']:
                    summary += f"- **Prerequisites**: {', '.join(template['prerequisites'])}\n"
                
                if template['tags']:
                    summary += f"- **Tags**: {', '.join(template['tags'])}\n"
                
                summary += "\n"
        
        summary += "\n## 🎯 **How to Create a Project**\n\n"
        summary += "To create any of these projects, just say:\n"
        summary += "- 'Create a Spring Boot project'\n"
        summary += "- 'I want to make a Node.js API'\n"
        summary += "- 'Help me set up a new Java microservice'\n\n"
        
        summary += "I'll guide you through the setup process step by step! 🛠️"
        
        return summary
    
    def get_template_by_technology(self, technology: str) -> str:
        """Get templates filtered by technology"""
        
        tech_lower = technology.lower()
        matching_templates = [
            t for t in self.templates_data["available_templates"] 
            if tech_lower in t["technology"].lower()
        ]
        
        if not matching_templates:
            available_techs = list(set([t["technology"] for t in self.templates_data["available_templates"]]))
            return f"No templates found for '{technology}'. Available technologies: {', '.join(available_techs)}"
        
        summary = f"🔧 **{technology} Templates**\n\n"
        
        for template in matching_templates:
            summary += f"### {template['display_name']}\n"
            summary += f"- **Platform**: {template['platform']}\n"
            summary += f"- **Build Tool**: {template['build_tech']}\n"
            summary += f"- **Description**: {template['description']}\n"
            
            if template['prerequisites']:
                summary += f"- **Prerequisites**: {', '.join(template['prerequisites'])}\n"
            
            summary += "\n"
        
        summary += f"\nTo create a {technology} project, just ask me and I'll guide you through it! 🚀"
        
        return summary
    
    def get_template_by_platform(self, platform: str) -> str:
        """Get templates filtered by platform"""
        
        platform_lower = platform.lower()
        matching_templates = [
            t for t in self.templates_data["available_templates"] 
            if platform_lower in t["platform"].lower()
        ]
        
        if not matching_templates:
            available_platforms = list(set([t["platform"] for t in self.templates_data["available_templates"]]))
            return f"No templates found for '{platform}'. Available platforms: {', '.join(available_platforms)}"
        
        summary = f"🏗️ **{platform} Platform Templates**\n\n"
        
        for template in matching_templates:
            summary += f"### {template['display_name']}\n"
            summary += f"- **Technology**: {template['technology']}\n"
            summary += f"- **Build Tool**: {template['build_tech']}\n"
            summary += f"- **Description**: {template['description']}\n"
            
            if template['prerequisites']:
                summary += f"- **Prerequisites**: {', '.join(template['prerequisites'])}\n"
            
            summary += "\n"
        
        summary += f"\nReady to deploy to {platform}? Just let me know what you want to build! 🎯"
        
        return summary
    
    def get_template_details(self, template_name: str) -> str:
        """Get detailed information about a specific template"""
        
        # Find template by name or display name
        template = None
        for t in self.templates_data["available_templates"]:
            if (template_name.lower() in t["name"].lower() or 
                template_name.lower() in t["display_name"].lower()):
                template = t
                break
        
        if not template:
            return f"Template '{template_name}' not found. Use 'list templates' to see all available options."
        
        details = f"📋 **{template['display_name']} - Detailed Information**\n\n"
        details += f"**Template ID**: {template['id']}\n"
        details += f"**Internal Name**: {template['name']}\n"
        details += f"**Technology**: {template['technology']}\n"
        details += f"**Build Tool**: {template['build_tech']}\n"
        details += f"**Platform**: {template['platform']}\n"
        details += f"**Category**: {template['category']}\n\n"
        
        details += f"**Description**: {template['description']}\n\n"
        
        if template['prerequisites']:
            details += "**Prerequisites**:\n"
            for prereq in template['prerequisites']:
                details += f"- {prereq}\n"
            details += "\n"
        
        if template['tags']:
            details += f"**Tags**: {', '.join(template['tags'])}\n\n"
        
        details += "**Ready to create this project?** Just say 'Create [project type]' and I'll walk you through it! 🚀"
        
        return details
    
    def search_templates(self, query: str) -> str:
        """Search templates based on query"""
        
        query_lower = query.lower()
        matching_templates = []
        
        for template in self.templates_data["available_templates"]:
            # Search in multiple fields
            searchable_text = " ".join([
                template["name"].lower(),
                template["display_name"].lower(),
                template["description"].lower(),
                template["technology"].lower(),
                template["platform"].lower(),
                template["category"].lower()
            ])
            
            if query_lower in searchable_text:
                matching_templates.append(template)
        
        if not matching_templates:
            return f"No templates found matching '{query}'. Try searching for specific technologies like 'Java', 'Node.js', or platforms like 'TKE', 'Conducktor'."
        
        summary = f"🔍 **Search Results for '{query}'**\n\n"
        summary += f"Found {len(matching_templates)} matching template(s):\n\n"
        
        for template in matching_templates:
            summary += f"### {template['display_name']}\n"
            summary += f"- **Technology**: {template['technology']} | **Platform**: {template['platform']}\n"
            summary += f"- **Description**: {template['description']}\n\n"
        
        summary += "Want details about any of these? Just ask! 💫"
        
        return summary