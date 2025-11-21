# API Scraper Usage Examples

## Basic Usage

Scrape the default Paid.ai API documentation:
```bash
python scrape_api.py
```

This will create `paid_api_docs.json` in the current directory.

## Advanced Usage

### Custom output file
```bash
python scrape_api.py --output my_api_docs.json
```

### Limit number of sub-pages
```bash
python scrape_api.py --max-subpages 5
```

### Enable verbose output
```bash
python scrape_api.py --verbose
```

### Scrape a different URL
```bash
python scrape_api.py --url https://docs.example.com/api/
```

### Combine multiple options
```bash
python scrape_api.py \
  --url https://docs.paid.ai/api-reference/ \
  --output paid_api_complete.json \
  --max-subpages 20 \
  --verbose
```

## Output Format

The scraper generates a JSON file with the following structure:

```json
{
  "base_url": "https://docs.paid.ai/api-reference/",
  "endpoints": [
    {
      "title": "Create Signal",
      "method": "POST",
      "path": "/api/v1/signals",
      "description": "Send a signal to track usage and cost",
      "parameters": [
        {
          "name": "order",
          "description": "Unique identifier for the order",
          "type": "string",
          "required": "Yes"
        }
      ],
      "responses": []
    }
  ],
  "sections": [
    {
      "title": "Authentication",
      "content": "All API requests require authentication...",
      "links": [
        {
          "text": "API Keys",
          "url": "https://docs.paid.ai/api-reference/auth"
        }
      ]
    }
  ]
}
```

## Testing

Run the test suite to verify the scraper functionality:
```bash
python test_scraper.py
```

The test suite uses sample HTML to demonstrate:
- Endpoint extraction
- Parameter parsing
- Section extraction
- JSON serialization

## Requirements

Install dependencies first:
```bash
pip install -r requirements.txt
```

Or install manually:
```bash
pip install requests beautifulsoup4 lxml
```

## Network Considerations

- The scraper respects rate limits by processing pages sequentially
- Default timeout is 30 seconds per request
- Network errors are handled gracefully
- If a page fails to load, the scraper continues with available data

## Troubleshooting

### Connection Error
If you see "Failed to fetch the main API reference page", it could be:
- Network connectivity issues
- DNS resolution problems
- The target site blocking requests
- Firewall restrictions

### Empty Results
If the output contains no endpoints or sections:
- The page structure may have changed
- The HTML patterns don't match what the scraper expects
- Try running with `--verbose` to see what's happening

### ImportError
If you get "No module named 'requests'" or similar:
```bash
pip install -r requirements.txt
```
