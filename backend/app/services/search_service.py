from duckduckgo_search import DDGS
import json

class SearchService:
    def __init__(self):
        self.ddgs = DDGS()

    def search(self, query: str, max_results: int = 5) -> str:
        """Perform a web search using DuckDuckGo (Google-like results)"""
        try:
            results = self.ddgs.text(query, max_results=max_results)
            if not results:
                return "No search results found."
            
            formatted_results = []
            for res in results:
                formatted_results.append(f"Title: {res.get('title')}\nLink: {res.get('href')}\nBody: {res.get('body')}\n")
            
            return "\n".join(formatted_results)
        except Exception as e:
            print(f"Search error: {e}")
            return f"Error performing search: {str(e)}"

search_service = SearchService()
