#!/usr/bin/env python3
"""
Parse.bot API Client for AI-powered web scraping.

This module provides a client for the Parse.bot API (https://www.parse.bot/)
which uses AI to extract structured data from websites.
"""

import json
import os
import sys
import time
from typing import Any, Dict, List, Optional

import requests


# Scraper ID for the documentation extraction scraper
DEFAULT_SCRAPER_ID = "5369961a-c9e0-4d5b-b711-756606e70e82"

# HTTP status codes that are safe to retry
RETRYABLE_STATUS_CODES = {500, 502, 503, 504, 429}


def format_parsebot_result(result: Dict[str, Any], url: str) -> Dict[str, Any]:
    """
    Format Parse.bot API result into standardized structure.
    
    Args:
        result: Raw result from Parse.bot API
        url: Source URL that was scraped
        
    Returns:
        Dictionary with standardized structure
    """
    # Handle the 'apis' format from extract_full_documentation
    apis = result.get("apis", [])
    
    # Convert apis to endpoints format
    endpoints = []
    for api in apis:
        endpoint = {
            "title": api.get("name", ""),
            "method": api.get("method", ""),
            "path": api.get("endpoint", ""),
            "description": api.get("description", ""),
            "parameters": api.get("parameters", []),
            "responses": [],
            "response_schema": api.get("response_schema", {}),
        }
        endpoints.append(endpoint)
    
    # If no apis but endpoints exist directly
    if not endpoints and "endpoints" in result:
        endpoints = result.get("endpoints", [])
    
    scraped_data = {
        "base_url": url,
        "endpoints": endpoints,
        "sections": result.get("sections", []),
        "authentication": result.get("authentication", {}),
        "metadata": result.get("metadata", {}),
        "scraped_with": "parse.bot",
    }
    
    if "examples" in result:
        scraped_data["examples"] = result["examples"]
    
    return scraped_data


class ParseBotClient:
    """Client for Parse.bot AI-powered web scraping API."""

    # API configuration
    BASE_URL = "https://api.parse.bot"
    
    # Request configuration
    REQUEST_TIMEOUT = 120  # Extended timeout for AI processing
    MAX_RETRIES = 3
    RETRY_DELAY = 2  # seconds

    def __init__(self, api_key: Optional[str] = None, scraper_id: Optional[str] = None):
        """
        Initialize the Parse.bot client.

        Args:
            api_key: Parse.bot API key. If not provided, reads from
                     PARSE_BOT_API_KEY environment variable.
            scraper_id: Parse.bot scraper ID. If not provided, uses the default
                       documentation extraction scraper.
        """
        self.api_key = api_key or os.environ.get("PARSE_BOT_API_KEY")
        if not self.api_key:
            raise ValueError(
                "Parse.bot API key is required. Set PARSE_BOT_API_KEY "
                "environment variable or pass api_key parameter."
            )
        
        self.scraper_id = scraper_id or DEFAULT_SCRAPER_ID

        self.session = requests.Session()
        self.session.headers.update({
            "X-API-Key": self.api_key,
            "Content-Type": "application/json",
            "Accept": "application/json",
        })

    def _make_request(
        self,
        endpoint: str,
        payload: Dict[str, Any],
    ) -> Dict[str, Any]:
        """
        Make a request to a Parse.bot scraper endpoint with retry logic.

        Args:
            endpoint: The scraper endpoint name (e.g., 'extract_full_documentation')
            payload: The request payload

        Returns:
            Dictionary containing the response data

        Raises:
            requests.RequestException: If the API request fails after retries
        """
        url = f"{self.BASE_URL}/scraper/{self.scraper_id}/{endpoint}"
        
        last_error = None
        for attempt in range(self.MAX_RETRIES):
            try:
                response = self.session.post(
                    url,
                    json=payload,
                    timeout=self.REQUEST_TIMEOUT,
                )
                response.raise_for_status()

                try:
                    result = response.json()
                except (json.JSONDecodeError, ValueError):
                    last_error = "Invalid JSON response"
                    print(
                        f"Attempt {attempt + 1}/{self.MAX_RETRIES}: "
                        "JSON decode error, retrying...",
                        file=sys.stderr,
                    )
                    if attempt < self.MAX_RETRIES - 1:
                        time.sleep(self.RETRY_DELAY * (attempt + 1))
                    continue

                return result

            except requests.exceptions.Timeout:
                last_error = "Request timed out"
                print(
                    f"Attempt {attempt + 1}/{self.MAX_RETRIES}: "
                    "Timeout, retrying...",
                    file=sys.stderr,
                )
            except requests.exceptions.HTTPError as e:
                status_code = e.response.status_code if e.response else 0
                # Only retry on server errors, not client errors
                if status_code in RETRYABLE_STATUS_CODES:
                    last_error = f"Server error ({status_code})"
                    print(
                        f"Attempt {attempt + 1}/{self.MAX_RETRIES}: "
                        f"Server error ({status_code}), retrying...",
                        file=sys.stderr,
                    )
                else:
                    # Don't retry client errors (4xx except 429)
                    raise requests.exceptions.RequestException(
                        f"API request failed with status {status_code}"
                    )
            except requests.exceptions.RequestException:
                last_error = "Request failed"
                print(
                    f"Attempt {attempt + 1}/{self.MAX_RETRIES}: "
                    "Request failed. (Details omitted for security)",
                    file=sys.stderr,
                )

            if attempt < self.MAX_RETRIES - 1:
                time.sleep(self.RETRY_DELAY * (attempt + 1))

        raise requests.exceptions.RequestException(
            f"Failed after {self.MAX_RETRIES} attempts: {last_error}"
        )

    def fetch_documentation_page(self, url: str) -> Dict[str, Any]:
        """
        Retrieve the raw HTML content of a documentation page.

        Args:
            url: The full URL of the documentation page to fetch.

        Returns:
            Dictionary with fetched_url and html_content
        """
        return self._make_request("fetch_documentation_page", {"url": url})

    def parse_api_list(self, html_content: str) -> Dict[str, Any]:
        """
        Parse HTML content to extract a list of available endpoints.

        Args:
            html_content: Raw HTML content of a documentation page.

        Returns:
            Dictionary with apis list containing endpoint, name, summary
        """
        return self._make_request("parse_api_list", {"html_content": html_content})

    def extract_api_details(self, html_content: str) -> Dict[str, Any]:
        """
        Extract detailed information about a specific endpoint.

        Args:
            html_content: Raw HTML content of the endpoint's documentation page.

        Returns:
            Dictionary with endpoint details including method, parameters, response_schema
        """
        return self._make_request("extract_api_details", {"html_content": html_content})

    def extract_full_documentation(self, base_url: str) -> Dict[str, Any]:
        """
        Extract all endpoints and their detailed documentation from the main API reference.

        Args:
            base_url: The main documentation URL containing the API reference.

        Returns:
            Dictionary with apis list containing all endpoints and their details
        """
        return self._make_request("extract_full_documentation", {"base_url": base_url})

    def scrape_api_documentation(self, url: str, include_examples: bool = True) -> Dict[str, Any]:
        """
        Scrape API documentation from a URL using the extract_full_documentation endpoint.

        Args:
            url: The API documentation URL to scrape
            include_examples: Whether to include code examples (not used with this method)

        Returns:
            Dictionary containing structured API documentation
        """
        return self.extract_full_documentation(url)

    def scrape_multiple_pages(
        self,
        urls: List[str],
        delay_between_requests: float = 1.0,
    ) -> List[Dict[str, Any]]:
        """
        Scrape multiple documentation pages.

        Args:
            urls: List of URLs to scrape
            delay_between_requests: Delay between requests in seconds

        Returns:
            List of results for each URL
        """
        results = []
        for i, url in enumerate(urls):
            print(f"Scraping page {i + 1}/{len(urls)}: {url}")
            try:
                result = self.extract_full_documentation(url)
                result["source_url"] = url
                results.append(result)
            except (requests.exceptions.RequestException, ValueError) as e:
                print(f"Error scraping {url}: {type(e).__name__}", file=sys.stderr)
                results.append({
                    "source_url": url,
                    "error": type(e).__name__,
                })

            if i < len(urls) - 1 and delay_between_requests > 0:
                time.sleep(delay_between_requests)

        return results


def scrape_paid_ai_docs(api_key: Optional[str] = None) -> Dict[str, Any]:
    """
    Scrape Paid.ai API documentation using Parse.bot.

    Args:
        api_key: Optional Parse.bot API key

    Returns:
        Dictionary containing the scraped API documentation
    """
    client = ParseBotClient(api_key=api_key)

    # Main API reference page
    base_url = "https://docs.paid.ai/api-reference/"

    print(f"Scraping Paid.ai API documentation from {base_url}")

    try:
        result = client.scrape_api_documentation(base_url)
        return format_parsebot_result(result, base_url)

    except (requests.exceptions.RequestException, ValueError) as e:
        print(f"Error scraping with Parse.bot: {type(e).__name__}", file=sys.stderr)
        raise


def main():
    """Main entry point for Parse.bot scraper."""
    import argparse

    parser = argparse.ArgumentParser(
        description="Scrape API documentation using Parse.bot AI"
    )
    parser.add_argument(
        "--url",
        default="https://docs.paid.ai/api-reference/",
        help="URL to scrape (default: https://docs.paid.ai/api-reference/)",
    )
    parser.add_argument(
        "--output",
        default="paid_api_docs.json",
        help="Output JSON file (default: paid_api_docs.json)",
    )
    parser.add_argument(
        "--api-key",
        help="Parse.bot API key (or set PARSE_BOT_API_KEY env var)",
    )
    parser.add_argument(
        "--query",
        help="Custom query for extraction (uses default API doc query if not provided)",
    )

    args = parser.parse_args()

    try:
        if args.query:
            client = ParseBotClient(api_key=args.api_key)
            result = client.scrape(args.url, args.query)
        else:
            result = scrape_paid_ai_docs(api_key=args.api_key)

        with open(args.output, "w", encoding="utf-8") as f:
            json.dump(result, f, indent=2, ensure_ascii=False)

        print(f"\n✓ Data saved to {args.output}")
        print(f"  Endpoints: {len(result.get('endpoints', []))}")
        print(f"  Sections: {len(result.get('sections', []))}")

        return 0

    except ValueError as e:
        print(f"Configuration error: {e}", file=sys.stderr)
        return 1
    except Exception as e:
        print(f"Error: {e}", file=sys.stderr)
        return 1


if __name__ == "__main__":
    sys.exit(main())
