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


# Query template for extracting API documentation
API_DOCUMENTATION_QUERY = """
Extract all API documentation from this page including:
1. All API endpoints with their:
   - HTTP method (GET, POST, PUT, DELETE, PATCH)
   - Path/URL pattern
   - Description
   - Request parameters (name, type, required, description)
   - Request body schema
   - Response schema
   - Response codes
2. Authentication information
3. Rate limiting information
4. Any code examples
5. API versioning information
6. Base URL
7. Section headers and navigation structure

Return the data in a structured JSON format with:
- endpoints: array of endpoint objects
- authentication: authentication details
- sections: documentation sections
- examples: code examples (if available)
- metadata: general API information
"""

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
    scraped_data = {
        "base_url": url,
        "endpoints": result.get("endpoints", []),
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
    SCRAPE_PATH = "/v1/scrape"

    # Request configuration
    REQUEST_TIMEOUT = 120  # Extended timeout for AI processing
    MAX_RETRIES = 3
    RETRY_DELAY = 2  # seconds

    def __init__(self, api_key: Optional[str] = None):
        """
        Initialize the Parse.bot client.

        Args:
            api_key: Parse.bot API key. If not provided, reads from
                     PARSE_BOT_API_KEY environment variable.
        """
        self.api_key = api_key or os.environ.get("PARSE_BOT_API_KEY")
        if not self.api_key:
            raise ValueError(
                "Parse.bot API key is required. Set PARSE_BOT_API_KEY "
                "environment variable or pass api_key parameter."
            )

        self.session = requests.Session()
        self.session.headers.update({
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
            "Accept": "application/json",
        })

    def scrape(
        self,
        url: str,
        query: str,
        variables: Optional[Dict[str, Any]] = None,
    ) -> Dict[str, Any]:
        """
        Scrape a website using Parse.bot's AI extraction.

        Args:
            url: The URL to scrape
            query: Natural language description of what data to extract
            variables: Optional variables to pass to the scraper

        Returns:
            Dictionary containing the extracted data

        Raises:
            requests.RequestException: If the API request fails after retries
        """
        payload = {
            "url": url,
            "query": query,
        }

        if variables:
            payload["variables"] = variables

        last_error = None
        for attempt in range(self.MAX_RETRIES):
            try:
                response = self.session.post(
                    f"{self.BASE_URL}{self.SCRAPE_PATH}",
                    json=payload,
                    timeout=self.REQUEST_TIMEOUT,
                )
                response.raise_for_status()

                try:
                    result = response.json()
                except (json.JSONDecodeError, ValueError) as e:
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

    def scrape_api_documentation(
        self,
        url: str,
        include_examples: bool = True,
    ) -> Dict[str, Any]:
        """
        Scrape API documentation from a URL.

        This method uses a specialized query for extracting API documentation
        including endpoints, parameters, and examples.

        Args:
            url: The API documentation URL to scrape
            include_examples: Whether to include code examples

        Returns:
            Dictionary containing structured API documentation
        """
        query = API_DOCUMENTATION_QUERY

        if not include_examples:
            query = query.replace(
                "4. Any code examples\n", ""
            ).replace(
                "- examples: code examples (if available)\n", ""
            )

        return self.scrape(url, query)

    def scrape_multiple_pages(
        self,
        urls: List[str],
        query: str,
        delay_between_requests: float = 1.0,
    ) -> List[Dict[str, Any]]:
        """
        Scrape multiple pages with the same query.

        Args:
            urls: List of URLs to scrape
            query: Natural language query to apply to each page
            delay_between_requests: Delay between requests in seconds

        Returns:
            List of results for each URL
        """
        results = []
        for i, url in enumerate(urls):
            print(f"Scraping page {i + 1}/{len(urls)}: {url}")
            try:
                result = self.scrape(url, query)
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
