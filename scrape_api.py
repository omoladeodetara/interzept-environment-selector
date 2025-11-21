#!/usr/bin/env python3
"""
API Documentation Scraper for Paid.ai

This script scrapes the API documentation from https://docs.paid.ai/api-reference/
and saves it in a structured JSON format.
"""

import json
import sys
import argparse
from typing import Dict, List, Any, Optional
from urllib.parse import urljoin, urlparse
import requests
from bs4 import BeautifulSoup


class PaidAPIDocScraper:
    """Scraper for Paid.ai API documentation."""
    
    # Class constants
    MAX_CONTENT_LENGTH = 500  # Maximum length for content preview
    DEFAULT_MAX_SUBPAGES = 10  # Default maximum number of sub-pages to scrape
    
    def __init__(self, base_url: str = "https://docs.paid.ai/api-reference/", max_subpages: int = None):
        """
        Initialize the scraper.
        
        Args:
            base_url: Base URL for the API documentation
            max_subpages: Maximum number of sub-pages to scrape (default: 10)
        """
        self.base_url = base_url
        self.max_subpages = max_subpages if max_subpages is not None else self.DEFAULT_MAX_SUBPAGES
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        })
        self.scraped_data = {
            "base_url": base_url,
            "endpoints": [],
            "sections": []
        }
    
    def fetch_page(self, url: str) -> Optional[BeautifulSoup]:
        """
        Fetch a page and return its parsed content.
        
        Args:
            url: URL to fetch
            
        Returns:
            BeautifulSoup object or None if fetch fails
        """
        try:
            response = self.session.get(url, timeout=30)
            response.raise_for_status()
            return BeautifulSoup(response.text, 'html.parser')
        except requests.RequestException as e:
            print(f"Error fetching {url}: {e}", file=sys.stderr)
            return None
    
    def extract_api_endpoints(self, soup: BeautifulSoup) -> List[Dict[str, Any]]:
        """
        Extract API endpoint information from the parsed HTML.
        
        Args:
            soup: BeautifulSoup object of the page
            
        Returns:
            List of endpoint dictionaries
        """
        endpoints = []
        
        # Look for API endpoint sections
        # Common patterns in API documentation:
        # - Headers with method badges (GET, POST, PUT, DELETE)
        # - Code blocks with endpoint URLs
        # - Description sections
        
        # Find all headers that might contain endpoint information
        for header in soup.find_all(['h1', 'h2', 'h3', 'h4']):
            endpoint_info = {
                "title": header.get_text(strip=True),
                "method": None,
                "path": None,
                "description": None,
                "parameters": [],
                "responses": []
            }
            
            # Look for method badges near the header
            method_badge = header.find(['span', 'code'], class_=[
                'badge-get', 'badge-post', 'badge-put', 'badge-delete', 'badge-patch'
            ])
            
            if method_badge:
                method_text = method_badge.get_text(strip=True).upper()
                for method in ['GET', 'POST', 'PUT', 'DELETE', 'PATCH']:
                    if method in method_text:
                        endpoint_info['method'] = method
                        break
            
            # Look for code blocks that might contain the endpoint path
            next_elem = header.find_next_sibling()
            depth = 0
            while next_elem and next_elem.name not in ['h1', 'h2'] and depth < 20:
                depth += 1
                
                # Check for code in current element or its children
                if next_elem.name == 'code' or next_elem.name == 'pre':
                    code_text = next_elem.get_text(strip=True)
                    if code_text.startswith('/') or 'api' in code_text.lower():
                        endpoint_info['path'] = code_text
                else:
                    # Look for code elements within this element
                    code_elem = next_elem.find(['code', 'pre'])
                    if code_elem:
                        code_text = code_elem.get_text(strip=True)
                        if code_text.startswith('/') or 'api' in code_text.lower():
                            endpoint_info['path'] = code_text
                
                if next_elem.name == 'p' and not endpoint_info['description']:
                    endpoint_info['description'] = next_elem.get_text(strip=True)
                
                # Look for parameter tables in current element or children
                if next_elem.name == 'table':
                    params = self.extract_parameters_from_table(next_elem)
                    if params:
                        endpoint_info['parameters'].extend(params)
                else:
                    # Look for tables within this element
                    for table in next_elem.find_all('table'):
                        params = self.extract_parameters_from_table(table)
                        if params:
                            endpoint_info['parameters'].extend(params)
                
                next_elem = next_elem.find_next_sibling()
            
            # Only add if we found meaningful endpoint information
            if endpoint_info['method'] or endpoint_info['path']:
                endpoints.append(endpoint_info)
        
        return endpoints
    
    def extract_parameters_from_table(self, table) -> List[Dict[str, str]]:
        """
        Extract parameters from a table element.
        
        Args:
            table: BeautifulSoup table element
            
        Returns:
            List of parameter dictionaries
        """
        parameters = []
        rows = table.find_all('tr')
        
        # Try to find header row to identify columns
        header_row = rows[0] if rows else None
        headers = []
        if header_row:
            headers = [th.get_text(strip=True).lower() for th in header_row.find_all(['th', 'td'])]
        
        for row in rows[1:]:
            cells = row.find_all(['td', 'th'])
            if len(cells) >= 2:
                param = {
                    "name": cells[0].get_text(strip=True),
                    "description": cells[1].get_text(strip=True) if len(cells) > 1 else "",
                    "type": cells[2].get_text(strip=True) if len(cells) > 2 else "",
                    "required": cells[3].get_text(strip=True) if len(cells) > 3 else ""
                }
                parameters.append(param)
        
        return parameters
    
    def extract_sections(self, soup: BeautifulSoup) -> List[Dict[str, Any]]:
        """
        Extract documentation sections.
        
        Args:
            soup: BeautifulSoup object of the page
            
        Returns:
            List of section dictionaries
        """
        sections = []
        
        # Find main content sections
        for section in soup.find_all(['section', 'article', 'div'], class_=lambda x: x and any(
            cls in str(x).lower() for cls in ['content', 'documentation', 'api-section', 'section']
        )):
            section_data = {
                "title": "",
                "content": section.get_text(strip=True)[:self.MAX_CONTENT_LENGTH],  # Content preview
                "links": []
            }
            
            # Find section title
            title_elem = section.find(['h1', 'h2', 'h3'])
            if title_elem:
                section_data['title'] = title_elem.get_text(strip=True)
            
            # Extract links
            for link in section.find_all('a', href=True):
                href = link.get('href')
                if href and not href.startswith('#'):
                    full_url = urljoin(self.base_url, href)
                    section_data['links'].append({
                        "text": link.get_text(strip=True),
                        "url": full_url
                    })
            
            if section_data['title'] or section_data['links']:
                sections.append(section_data)
        
        return sections
    
    def scrape(self) -> Dict[str, Any]:
        """
        Perform the scraping operation.
        
        Returns:
            Dictionary containing scraped data
        """
        print(f"Scraping API documentation from {self.base_url}")
        
        # Fetch the main API reference page
        soup = self.fetch_page(self.base_url)
        
        if not soup:
            print("Failed to fetch the main API reference page", file=sys.stderr)
            return self.scraped_data
        
        # Extract endpoints
        print("Extracting API endpoints...")
        self.scraped_data['endpoints'] = self.extract_api_endpoints(soup)
        print(f"Found {len(self.scraped_data['endpoints'])} endpoints")
        
        # Extract sections
        print("Extracting documentation sections...")
        self.scraped_data['sections'] = self.extract_sections(soup)
        print(f"Found {len(self.scraped_data['sections'])} sections")
        
        # Look for sub-pages in navigation
        nav_links = self._find_navigation_links(soup)
        if nav_links:
            print(f"Found {len(nav_links)} sub-pages to scrape")
            max_pages = min(len(nav_links), self.max_subpages)
            for i, link in enumerate(nav_links[:max_pages], 1):
                print(f"Scraping sub-page {i}/{max_pages}: {link}")
                self._scrape_subpage(link)
        
        return self.scraped_data
    
    def _find_navigation_links(self, soup: BeautifulSoup) -> List[str]:
        """
        Find navigation links to other API documentation pages.
        
        Args:
            soup: BeautifulSoup object
            
        Returns:
            List of URLs
        """
        links = []
        nav_elements = soup.find_all(['nav', 'aside', 'div'], class_=lambda x: x and any(
            cls in str(x).lower() for cls in ['nav', 'sidebar', 'menu', 'toc']
        ))
        
        for nav in nav_elements:
            for link in nav.find_all('a', href=True):
                href = link.get('href')
                if href and not href.startswith('#'):
                    full_url = urljoin(self.base_url, href)
                    # Only include links from the same domain
                    if urlparse(full_url).netloc == urlparse(self.base_url).netloc:
                        if full_url not in links and full_url != self.base_url:
                            links.append(full_url)
        
        return links
    
    def _scrape_subpage(self, url: str) -> None:
        """
        Scrape a sub-page and add its data to the main scraped data.
        
        Args:
            url: URL of the sub-page
        """
        soup = self.fetch_page(url)
        if soup:
            endpoints = self.extract_api_endpoints(soup)
            self.scraped_data['endpoints'].extend(endpoints)
            
            sections = self.extract_sections(soup)
            for section in sections:
                section['source_url'] = url
            self.scraped_data['sections'].extend(sections)
    
    def save_to_file(self, filename: str = "paid_api_docs.json") -> None:
        """
        Save scraped data to a JSON file.
        
        Args:
            filename: Output filename
        """
        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(self.scraped_data, f, indent=2, ensure_ascii=False)
        print(f"Data saved to {filename}")


def main():
    """Main entry point for the scraper."""
    parser = argparse.ArgumentParser(
        description="Scrape API documentation from Paid.ai"
    )
    parser.add_argument(
        '--url',
        default='https://docs.paid.ai/api-reference/',
        help='Base URL for API documentation (default: https://docs.paid.ai/api-reference/)'
    )
    parser.add_argument(
        '--output',
        default='paid_api_docs.json',
        help='Output JSON file (default: paid_api_docs.json)'
    )
    parser.add_argument(
        '--max-subpages',
        type=int,
        default=10,
        help='Maximum number of sub-pages to scrape (default: 10)'
    )
    parser.add_argument(
        '--verbose',
        action='store_true',
        help='Enable verbose output'
    )
    
    args = parser.parse_args()
    
    try:
        scraper = PaidAPIDocScraper(base_url=args.url, max_subpages=args.max_subpages)
        data = scraper.scrape()
        scraper.save_to_file(args.output)
        
        if args.verbose:
            print("\nScraping Summary:")
            print(f"Total endpoints found: {len(data['endpoints'])}")
            print(f"Total sections found: {len(data['sections'])}")
            
            if data['endpoints']:
                print("\nEndpoints:")
                for endpoint in data['endpoints']:
                    print(f"  - {endpoint.get('method', 'N/A')} {endpoint.get('path', endpoint.get('title', 'N/A'))}")
        
        print("\n✓ Scraping completed successfully!")
        return 0
        
    except Exception as e:
        print(f"Error during scraping: {e}", file=sys.stderr)
        import traceback
        traceback.print_exc()
        return 1


if __name__ == "__main__":
    sys.exit(main())
