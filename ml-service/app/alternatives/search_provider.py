import os
import requests
from abc import ABC, abstractmethod
from typing import List, Dict, Any
import logging

logger = logging.getLogger(__name__)

class SearchProvider(ABC):
    @abstractmethod
    def is_configured(self) -> bool:
        pass

    @abstractmethod
    def search(self, query: str) -> List[Dict[str, Any]]:
        pass

class GoogleCustomSearchProvider(SearchProvider):
    def __init__(self):
        self.api_key = os.environ.get("SEARCH_API_KEY")
        self.engine_id = os.environ.get("SEARCH_ENGINE_ID")
        self.base_url = "https://www.googleapis.com/customsearch/v1"

    def is_configured(self) -> bool:
        return bool(self.api_key and self.engine_id)

    def search(self, query: str) -> List[Dict[str, Any]]:
        if not self.is_configured():
            return []

        try:
            params = {
                "key": self.api_key,
                "cx": self.engine_id,
                "q": query,
                "num": 5
            }
            response = requests.get(self.base_url, params=params, timeout=5.0)
            response.raise_for_status()
            data = response.json()

            results = []
            for item in data.get("items", []):
                results.append({
                    "title": item.get("title", ""),
                    "url": item.get("link", ""),
                    "description": item.get("snippet", ""),
                    "provider": item.get("displayLink", "")
                })
            return results
        except requests.Timeout:
            logger.error("Search provider failed: Connection timed out")
            return []
        except requests.RequestException as e:
            status = e.response.status_code if e.response else "Unknown"
            logger.error(f"Search provider failed: HTTP {status}")
            return []
        except Exception:
            logger.error("Search provider failed: Internal error")
            return []

def get_search_provider() -> SearchProvider:
    return GoogleCustomSearchProvider()
