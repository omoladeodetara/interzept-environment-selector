# API Scraper Usage Examples

## Scraping Methods

The scraper supports two methods:
1. **HTML parsing** (default) - Uses BeautifulSoup to parse HTML directly
2. **Parse.bot AI** - Uses Parse.bot's AI-powered extraction (requires API key)

## Basic Usage

### HTML Parsing Method (Default)

Scrape the default Paid.ai API documentation:
```bash
python scrape_api.py
```

This will create `paid_api_docs.json` in the current directory.

### Parse.bot AI Method

Use Parse.bot's AI-powered extraction for more accurate results:

```bash
# Set your API key
export PARSE_BOT_API_KEY="your-api-key-here"

# Run with Parse.bot method
python scrape_api.py --method parsebot
```

Or use the dedicated Parse.bot client:

```bash
export PARSE_BOT_API_KEY="your-api-key-here"
python parsebot_client.py --url https://docs.paid.ai/api-reference/
```

## Advanced Usage

### Custom output file
```bash
python scrape_api.py --output my_api_docs.json
```

### Using Parse.bot with inline API key
```bash
python scrape_api.py --method parsebot --api-key "your-api-key-here"
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
  --method parsebot \
  --verbose
```

### Parse.bot with Custom Query

Use the Parse.bot client directly with a custom extraction query:

```bash
python parsebot_client.py \
  --url https://example.com/docs \
  --query "Extract all API endpoints with their methods, paths, and descriptions" \
  --output custom_docs.json
```

## Output Format

### HTML Method Output

The HTML scraper generates a JSON file with the following structure:

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

### Parse.bot Method Output

When using the Parse.bot method, the output includes additional AI-extracted fields:

```json
{
  "base_url": "https://docs.paid.ai/api-reference/",
  "endpoints": [...],
  "sections": [...],
  "authentication": {
    "type": "Bearer Token",
    "description": "All API requests require a Bearer token..."
  },
  "metadata": {
    "api_version": "v1",
    "base_url": "https://api.agentpaid.io/api/v1"
  },
  "examples": [...],
  "scraped_with": "parse.bot"
}
```

## Environment Variables

| Variable | Description |
|----------|-------------|
| `PARSE_BOT_API_KEY` | API key for Parse.bot service (required for `--method parsebot`) |

## Testing

Run the test suite to verify the scraper functionality:
```bash
python test_scraper.py
```

Or use pytest:
```bash
pytest test_scraper.py -v
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
