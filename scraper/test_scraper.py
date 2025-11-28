#!/usr/bin/env python3
"""
Test suite for the Paid.ai API documentation scraper.

This module tests the scraper functionality with sample HTML data using pytest.
"""

import json
import tempfile
import os
import pytest
from scrape_api import PaidAPIDocScraper
from bs4 import BeautifulSoup


# Sample HTML that mimics API documentation structure
SAMPLE_API_HTML = """
<!DOCTYPE html>
<html>
<head><title>Paid.ai API Reference</title></head>
<body>
    <nav class="sidebar">
        <a href="/api-reference/signals">Signals API</a>
        <a href="/api-reference/webhooks">Webhooks</a>
        <a href="/api-reference/customers">Customers</a>
    </nav>
    
    <section class="api-section">
        <h2>
            <span class="badge-post">POST</span>
            Create Signal
        </h2>
        <code>/api/v1/signals</code>
        <p>Send a signal to track usage and cost for a specific order.</p>
        
        <h3>Parameters</h3>
        <table>
            <tr>
                <th>Name</th>
                <th>Description</th>
                <th>Type</th>
                <th>Required</th>
            </tr>
            <tr>
                <td>order</td>
                <td>Unique identifier for the order</td>
                <td>string</td>
                <td>Yes</td>
            </tr>
            <tr>
                <td>type</td>
                <td>Type of signal event</td>
                <td>string</td>
                <td>Yes</td>
            </tr>
            <tr>
                <td>properties</td>
                <td>Additional properties for the signal</td>
                <td>object</td>
                <td>No</td>
            </tr>
        </table>
    </section>
    
    <section class="api-section">
        <h2>
            <span class="badge-get">GET</span>
            List Customers
        </h2>
        <code>/api/v1/customers</code>
        <p>Retrieve a list of all customers in your account.</p>
        
        <h3>Query Parameters</h3>
        <table>
            <tr>
                <th>Name</th>
                <th>Description</th>
                <th>Type</th>
            </tr>
            <tr>
                <td>limit</td>
                <td>Maximum number of results to return</td>
                <td>integer</td>
            </tr>
            <tr>
                <td>offset</td>
                <td>Number of results to skip</td>
                <td>integer</td>
            </tr>
        </table>
    </section>
    
    <section class="documentation">
        <h2>Authentication</h2>
        <p>All API requests require authentication using a Bearer token.</p>
        <code>Authorization: Bearer YOUR_API_KEY</code>
    </section>
</body>
</html>
"""


def test_endpoint_extraction():
    """Test extraction of API endpoints from HTML."""
    print("Testing endpoint extraction...")
    
    scraper = PaidAPIDocScraper()
    soup = BeautifulSoup(SAMPLE_API_HTML, 'html.parser')
    
    endpoints = scraper.extract_api_endpoints(soup)
    
    print(f"\n✓ Extracted {len(endpoints)} endpoints:")
    for endpoint in endpoints:
        method = endpoint.get('method', 'N/A')
        path = endpoint.get('path', 'N/A')
        title = endpoint.get('title', 'N/A')
        params = len(endpoint.get('parameters', []))
        print(f"  - {method} {path}")
        print(f"    Title: {title}")
        print(f"    Parameters: {params}")
        if endpoint.get('description'):
            print(f"    Description: {endpoint['description'][:80]}...")
    
    assert len(endpoints) > 0, "Should extract at least one endpoint"
    
    # Check that we found the POST endpoint
    post_endpoints = [e for e in endpoints if e.get('method') == 'POST']
    assert len(post_endpoints) > 0, "Should find POST endpoint"
    
    # Check that we found parameters
    endpoints_with_params = [e for e in endpoints if e.get('parameters')]
    assert len(endpoints_with_params) > 0, "Should extract parameters"
    
    print("\n✓ Endpoint extraction test passed!")
    return endpoints


def test_section_extraction():
    """Test extraction of documentation sections from HTML."""
    print("\nTesting section extraction...")
    
    scraper = PaidAPIDocScraper()
    soup = BeautifulSoup(SAMPLE_API_HTML, 'html.parser')
    
    sections = scraper.extract_sections(soup)
    
    print(f"\n✓ Extracted {len(sections)} sections:")
    for section in sections:
        title = section.get('title', 'Untitled')
        links = len(section.get('links', []))
        content_preview = section.get('content', '')[:60]
        print(f"  - {title}")
        print(f"    Links: {links}")
        if content_preview:
            print(f"    Content preview: {content_preview}...")
    
    assert len(sections) > 0, "Should extract at least one section"
    
    print("\n✓ Section extraction test passed!")
    return sections


def test_json_serialization():
    """Test that scraped data can be serialized to JSON."""
    print("\nTesting JSON serialization...")
    
    scraper = PaidAPIDocScraper()
    soup = BeautifulSoup(SAMPLE_API_HTML, 'html.parser')
    
    scraper.scraped_data['endpoints'] = scraper.extract_api_endpoints(soup)
    scraper.scraped_data['sections'] = scraper.extract_sections(soup)
    
    # Try to serialize to JSON
    json_str = json.dumps(scraper.scraped_data, indent=2, ensure_ascii=False)
    
    # Verify it can be loaded back
    loaded_data = json.loads(json_str)
    
    print("✓ Data structure:")
    print(f"  - Endpoints: {len(loaded_data['endpoints'])}")
    print(f"  - Sections: {len(loaded_data['sections'])}")
    print(f"  - JSON size: {len(json_str)} bytes")
    
    # Save to temp file and clean up properly
    temp_file = None
    try:
        with tempfile.NamedTemporaryFile(mode='w', suffix='.json', delete=False) as f:
            f.write(json_str)
            temp_file = f.name
        
        print(f"✓ Successfully saved to temporary file: {temp_file}")
    finally:
        # Clean up temporary file
        if temp_file and os.path.exists(temp_file):
            try:
                os.unlink(temp_file)
                print(f"✓ Cleaned up temporary file: {temp_file}")
            except OSError as e:
                print(f"⚠ Warning: Could not delete temp file: {e}")
    
    print("\n✓ JSON serialization test passed!")


def test_parameter_extraction():
    """Test parameter table parsing."""
    print("\nTesting parameter extraction...")
    
    scraper = PaidAPIDocScraper()
    soup = BeautifulSoup(SAMPLE_API_HTML, 'html.parser')
    
    # Find first table
    table = soup.find('table')
    if table:
        params = scraper.extract_parameters_from_table(table)
        print(f"\n✓ Extracted {len(params)} parameters:")
        for param in params:
            print(f"  - {param['name']}: {param['description'][:50]}...")
            print(f"    Type: {param['type']}, Required: {param['required']}")
        
        assert len(params) > 0, "Should extract parameters from table"
        print("\n✓ Parameter extraction test passed!")
    else:
        print("⚠ No table found in sample HTML")


def test_parsebot_client_initialization():
    """Test ParseBotClient initialization and validation."""
    print("\nTesting ParseBotClient initialization...")
    
    # Test that client requires API key
    import os
    original_key = os.environ.get('PARSE_BOT_API_KEY')
    
    try:
        # Remove env var if present
        if 'PARSE_BOT_API_KEY' in os.environ:
            del os.environ['PARSE_BOT_API_KEY']
        
        # Should raise ValueError without API key
        from parsebot_client import ParseBotClient
        try:
            ParseBotClient()
            assert False, "Should raise ValueError without API key"
        except ValueError as e:
            assert "API key is required" in str(e)
            print("✓ Correctly raises ValueError without API key")
        
        # Should accept API key as parameter
        client = ParseBotClient(api_key="test-api-key")
        assert client.api_key == "test-api-key"
        print("✓ Accepts API key as parameter")
        
        # Should read from environment variable
        os.environ['PARSE_BOT_API_KEY'] = "env-api-key"
        client = ParseBotClient()
        assert client.api_key == "env-api-key"
        print("✓ Reads API key from environment variable")
        
    finally:
        # Restore original env var
        if original_key:
            os.environ['PARSE_BOT_API_KEY'] = original_key
        elif 'PARSE_BOT_API_KEY' in os.environ:
            del os.environ['PARSE_BOT_API_KEY']
    
    print("\n✓ ParseBotClient initialization test passed!")


def test_parsebot_client_headers():
    """Test that ParseBotClient sets correct headers."""
    print("\nTesting ParseBotClient headers...")
    
    from parsebot_client import ParseBotClient
    client = ParseBotClient(api_key="test-key")
    
    headers = client.session.headers
    assert "Authorization" in headers
    assert headers["Authorization"] == "Bearer test-key"
    assert headers["Content-Type"] == "application/json"
    assert headers["Accept"] == "application/json"
    
    print("✓ Headers are correctly set")
    print("\n✓ ParseBotClient headers test passed!")


def test_format_parsebot_result():
    """Test the format_parsebot_result helper function."""
    print("\nTesting format_parsebot_result...")
    
    from parsebot_client import format_parsebot_result
    
    # Test with complete result
    result = {
        "endpoints": [{"method": "GET", "path": "/api/test"}],
        "sections": [{"title": "Test Section"}],
        "authentication": {"type": "bearer"},
        "metadata": {"version": "1.0"},
        "examples": [{"code": "curl example"}],
    }
    
    formatted = format_parsebot_result(result, "https://example.com/api")
    
    assert formatted["base_url"] == "https://example.com/api"
    assert formatted["scraped_with"] == "parse.bot"
    assert formatted["endpoints"] == result["endpoints"]
    assert formatted["sections"] == result["sections"]
    assert formatted["authentication"] == result["authentication"]
    assert formatted["metadata"] == result["metadata"]
    assert formatted["examples"] == result["examples"]
    print("✓ Complete result formatted correctly")
    
    # Test with minimal result
    minimal_result = {}
    formatted_minimal = format_parsebot_result(minimal_result, "https://example.com")
    
    assert formatted_minimal["endpoints"] == []
    assert formatted_minimal["sections"] == []
    assert formatted_minimal["authentication"] == {}
    assert formatted_minimal["metadata"] == {}
    assert "examples" not in formatted_minimal
    print("✓ Minimal result handled correctly")
    
    print("\n✓ format_parsebot_result test passed!")


def test_parsebot_scrape_path():
    """Test that ParseBotClient uses correct API path."""
    print("\nTesting ParseBotClient API path...")
    
    from parsebot_client import ParseBotClient
    
    assert ParseBotClient.SCRAPE_PATH == "/v1/scrape"
    assert ParseBotClient.BASE_URL == "https://api.parse.bot"
    
    print("✓ API path configuration is correct")
    print("\n✓ ParseBotClient API path test passed!")


def main():
    """Run all tests."""
    print("=" * 60)
    print("Paid.ai API Scraper - Test Suite")
    print("=" * 60)
    
    try:
        test_endpoint_extraction()
        test_section_extraction()
        test_parameter_extraction()
        test_json_serialization()
        test_parsebot_client_initialization()
        test_parsebot_client_headers()
        test_format_parsebot_result()
        test_parsebot_scrape_path()
        
        print("\n" + "=" * 60)
        print("✓ ALL TESTS PASSED!")
        print("=" * 60)
        print("\nThe scraper is working correctly with sample data.")
        print("When network access to docs.paid.ai is available, it will")
        print("scrape the actual API documentation.")
        print("\nTo use Parse.bot AI-powered scraping:")
        print("  export PARSE_BOT_API_KEY='your-api-key'")
        print("  python scrape_api.py --method parsebot")
        
        return 0
        
    except AssertionError as e:
        print(f"\n✗ Test failed: {e}")
        return 1
    except Exception as e:
        print(f"\n✗ Unexpected error: {e}")
        import traceback
        traceback.print_exc()
        return 1


if __name__ == "__main__":
    import sys
    sys.exit(main())
