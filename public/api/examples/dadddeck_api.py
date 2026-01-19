"""
DadDeck API Python SDK

A Python client for the DadDeck Trading Card Game API.

Installation:
    pip install requests

Usage:
    from dadddeck_api import DadDeckAPI

    client = DadDeckAPI(api_key="ddpk_live_abc123...")
    cards = client.cards.list(page=1, page_size=50)
"""

from typing import Optional, List, Dict, Any, BinaryIO
from dataclasses import dataclass
from enum import Enum
import json
import time
from datetime import datetime, timezone
import requests


class ApiTier(str, Enum):
    """API access tiers"""
    FREE = "free"
    BASIC = "basic"
    PRO = "pro"
    ENTERPRISE = "enterprise"


class APIError(Exception):
    """
    Custom exception for API errors.

    Attributes:
        code: Machine-readable error code
        message: Human-readable error message
        status: HTTP status code
        rate_limit: Rate limit information from response
        request_id: Unique request identifier
    """

    def __init__(
        self,
        code: str,
        message: str,
        status: Optional[int] = None,
        rate_limit: Optional[Dict[str, Any]] = None,
        request_id: Optional[str] = None,
    ):
        self.code = code
        self.message = message
        self.status = status
        self.rate_limit = rate_limit
        self.request_id = request_id
        super().__init__(message)

    def is_rate_limit_error(self) -> bool:
        """Check if error is due to rate limiting"""
        return self.code == "RATE_LIMIT_EXCEEDED"

    def is_auth_error(self) -> bool:
        """Check if error is due to authentication"""
        return self.code == "UNAUTHORIZED"

    def get_retry_delay(self) -> int:
        """
        Get retry delay in milliseconds

        Returns:
            Milliseconds to wait before retrying
        """
        if self.rate_limit and self.rate_limit.get("resetAt"):
            reset_at = self.rate_limit["resetAt"]
            if isinstance(reset_at, str):
                reset_at = datetime.fromisoformat(reset_at.replace("Z", "+00:00"))
            delay_ms = int((reset_at - datetime.now(timezone.utc)).total_seconds() * 1000)
            return max(0, delay_ms)
        return 60000  # Default: 1 minute

    def __str__(self):
        return f"[{self.code}] {self.message}"


@dataclass
class RateLimitInfo:
    """Rate limit information from API response"""
    limit: int
    remaining: int
    reset_at: Optional[datetime]
    tier: str


@dataclass
class ApiResponse:
    """
    Wrapper for API responses

    Attributes:
        data: Response data (if successful)
        error: Error information (if failed)
        meta: Response metadata
        rate_limit: Rate limit information
    """
    data: Optional[Any] = None
    error: Optional[Dict[str, Any]] = None
    meta: Optional[Dict[str, Any]] = None
    rate_limit: Optional[RateLimitInfo] = None

    @property
    def success(self) -> bool:
        """Check if request was successful"""
        return self.error is None


class DadDeckAPI:
    """
    DadDeck API Client

    Example:
        >>> client = DadDeckAPI(api_key="ddpk_live_abc123...")
        >>> response = client.cards.list(page=1)
        >>> print(response.data["cards"][0]["name"])
        Grillmaster Gary
    """

    def __init__(
        self,
        api_key: str,
        base_url: str = "https://api.dadddeck.com/v1",
        timeout: int = 30,
    ):
        """
        Initialize API client

        Args:
            api_key: Your DadDeck API key
            base_url: API base URL (default: production)
            timeout: Request timeout in seconds
        """
        self.api_key = api_key
        self.base_url = base_url.rstrip("/")
        self.timeout = timeout
        self.session = requests.Session()
        self.session.headers.update({
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
        })

    def _request(
        self,
        method: str,
        endpoint: str,
        params: Optional[Dict[str, Any]] = None,
        data: Optional[Dict[str, Any]] = None,
    ) -> ApiResponse:
        """
        Make an authenticated API request

        Args:
            method: HTTP method
            endpoint: API endpoint path
            params: Query parameters
            data: Request body

        Returns:
            ApiResponse object

        Raises:
            APIError: On API errors
        """
        url = f"{self.base_url}/{endpoint.lstrip('/')}"

        try:
            response = self.session.request(
                method=method,
                url=url,
                params=params,
                json=data,
                timeout=self.timeout,
            )

            # Parse rate limit headers
            rate_limit = self._parse_rate_limit_headers(response.headers)

            # Handle error responses
            if not response.ok:
                error_data = response.json()
                error = error_data.get("error", {})
                raise APIError(
                    code=error.get("code", "API_ERROR"),
                    message=error.get("message", "Unknown error"),
                    status=response.status_code,
                    rate_limit=rate_limit,
                    request_id=error_data.get("meta", {}).get("requestId"),
                )

            # Parse successful response
            response_data = response.json()
            return ApiResponse(
                data=response_data.get("data"),
                error=response_data.get("error"),
                meta=response_data.get("meta"),
                rate_limit=rate_limit,
            )

        except APIError:
            raise
        except requests.exceptions.Timeout:
            raise APIError("TIMEOUT", f"Request timed out after {self.timeout}s")
        except requests.exceptions.RequestException as e:
            raise APIError("NETWORK_ERROR", str(e))

    def _parse_rate_limit_headers(self, headers) -> Optional[RateLimitInfo]:
        """Parse rate limit headers from response"""
        limit = headers.get("X-RateLimit-Limit")
        if not limit:
            return None

        remaining = int(headers.get("X-RateLimit-Remaining", 0))
        reset_at = headers.get("X-RateLimit-Reset")
        tier = headers.get("X-RateLimit-Tier", "unknown")

        reset_dt = None
        if reset_at:
            reset_dt = datetime.fromtimestamp(int(reset_at), tz=timezone.utc)

        return RateLimitInfo(
            limit=int(limit),
            remaining=remaining,
            reset_at=reset_dt,
            tier=tier,
        )

    class CardsAPI:
        """Cards API endpoints"""

        def __init__(self, client):
            self.client = client

        def list(
            self,
            page: int = 1,
            page_size: int = 50,
            rarity: Optional[str] = None,
            type: Optional[str] = None,
            series: Optional[int] = None,
            search: Optional[str] = None,
        ) -> ApiResponse:
            """
            List all cards with pagination and filters

            Args:
                page: Page number (default: 1)
                page_size: Cards per page (default: 50, max: 100)
                rarity: Filter by rarity (common, uncommon, rare, epic, legendary, mythic)
                type: Filter by dad type
                series: Filter by series number
                search: Search in card name and flavor text

            Returns:
                ApiResponse with cards data

            Example:
                >>> response = client.cards.list(rarity="rare", page_size=20)
                >>> for card in response.data["cards"]:
                ...     print(f"{card['name']} - {card['rarity']}")
            """
            params = {
                "page": page,
                "pageSize": page_size,
            }
            if rarity:
                params["rarity"] = rarity
            if type:
                params["type"] = type
            if series:
                params["series"] = series
            if search:
                params["search"] = search

            return self.client._request("GET", "/cards", params=params)

        def get(self, card_id: str) -> ApiResponse:
            """
            Get a specific card by ID

            Args:
                card_id: Unique card identifier

            Returns:
                ApiResponse with card data

            Example:
                >>> card = client.cards.get("bbq_dad_001")
                >>> print(card.data["name"])
                Grillmaster Gary
            """
            return self.client._request("GET", f"/cards/{card_id}")

        def random(
            self,
            count: int = 1,
            rarity: Optional[str] = None,
            type: Optional[str] = None,
            exclude: Optional[List[str]] = None,
        ) -> ApiResponse:
            """
            Get random cards

            Args:
                count: Number of cards (1-10)
                rarity: Filter to specific rarity
                type: Filter to specific dad type
                exclude: Card IDs to exclude from results

            Returns:
                ApiResponse with random cards

            Example:
                >>> response = client.cards.random(count=5, rarity="legendary")
                >>> cards = response.data["cards"]
            """
            params = {"count": count}
            if rarity:
                params["rarity"] = rarity
            if type:
                params["type"] = type

            data = {"exclude": exclude} if exclude else None

            return self.client._request("POST", "/cards/random", params=params, data=data)

    @property
    def cards(self) -> CardsAPI:
        """Access Cards API"""
        return self.CardsAPI(self)

    class PacksAPI:
        """Packs API endpoints"""

        def __init__(self, client):
            self.client = client

        def generate(
            self,
            pack_type: str = "standard",
            count: int = 1,
            design: Optional[str] = None,
            series: Optional[int] = None,
        ) -> ApiResponse:
            """
            Generate new pack(s)

            Args:
                pack_type: Pack type (standard or premium)
                count: Number of packs to generate (1-10)
                design: Specific pack design
                series: Specific series number

            Returns:
                ApiResponse with generated packs

            Example:
                >>> response = client.packs.generate(count=3, pack_type="premium")
                >>> for pack in response.data["packs"]:
                ...     print(f"Pack: {len(pack['cards'])} cards")
            """
            data = {
                "packType": pack_type,
                "count": count,
            }
            if design:
                data["design"] = design
            if series:
                data["series"] = series

            return self.client._request("POST", "/packs/generate", data=data)

    @property
    def packs(self) -> PacksAPI:
        """Access Packs API"""
        return self.PacksAPI(self)

    class CollectionsAPI:
        """Collections API endpoints"""

        def __init__(self, client):
            self.client = client

        def get(
            self,
            user_id: str,
            rarity: Optional[str] = None,
            sort_by: str = "rarity",
            sort_order: str = "desc",
            page: int = 1,
            page_size: int = 50,
        ) -> ApiResponse:
            """
            Get user's collection

            Args:
                user_id: User identifier
                rarity: Filter by rarity
                sort_by: Sort field (rarity, name, date_obtained)
                sort_order: Sort order (asc or desc)
                page: Page number
                page_size: Items per page

            Returns:
                ApiResponse with collection data
            """
            params = {
                "sortBy": sort_by,
                "sortOrder": sort_order,
                "page": page,
                "pageSize": page_size,
            }
            if rarity:
                params["rarity"] = rarity

            return self.client._request("GET", f"/collections/{user_id}", params=params)

    @property
    def collections(self) -> CollectionsAPI:
        """Access Collections API"""
        return self.CollectionsAPI(self)

    class LeaderboardAPI:
        """Leaderboard API endpoints"""

        def __init__(self, client):
            self.client = client

        def get(
            self,
            limit: int = 100,
            offset: int = 0,
        ) -> ApiResponse:
            """
            Get global leaderboard

            Args:
                limit: Number of entries (max: 1000)
                offset: Number of entries to skip

            Returns:
                ApiResponse with leaderboard data

            Example:
                >>> response = client.leaderboard.get(limit=10)
                >>> for entry in response.data["entries"]:
                ...     print(f"#{entry['rank']}: {entry['username']}")
            """
            params = {
                "limit": min(limit, 1000),
                "offset": offset,
            }
            return self.client._request("GET", "/leaderboard", params=params)

    @property
    def leaderboard(self) -> LeaderboardAPI:
        """Access Leaderboard API"""
        return self.LeaderboardAPI(self)

    class EventsAPI:
        """Events API endpoints"""

        def __init__(self, client):
            self.client = client

        def list(
            self,
            status: Optional[str] = None,
        ) -> ApiResponse:
            """
            List all events

            Args:
                status: Filter by status (active, upcoming, ended)

            Returns:
                ApiResponse with events list

            Example:
                >>> response = client.events.list(status="active")
                >>> for event in response.data["events"]:
                ...     print(f"{event['name']}: {event['status']}")
            """
            params = {}
            if status:
                params["status"] = status

            return self.client._request("GET", "/events", params=params)

        def get(self, event_id: str) -> ApiResponse:
            """
            Get specific event details

            Args:
                event_id: Event identifier

            Returns:
                ApiResponse with event data
            """
            return self.client._request("GET", f"/events/{event_id}")

    @property
    def events(self) -> EventsAPI:
        """Access Events API"""
        return self.EventsAPI(self)

    class AuthAPI:
        """Auth API endpoints (API Key Management)"""

        def __init__(self, client):
            self.client = client

        def list_keys(self) -> ApiResponse:
            """
            List all API keys for your account

            Returns:
                ApiResponse with API keys list
            """
            return self.client._request("GET", "/auth/keys")

        def create_key(
            self,
            name: str,
            tier: ApiTier = ApiTier.FREE,
            expires_at: Optional[datetime] = None,
            allowed_origins: Optional[List[str]] = None,
        ) -> ApiResponse:
            """
            Create a new API key

            Args:
                name: Human-readable name for the key
                tier: Access tier level
                expires_at: Optional expiration date
                allowed_origins: CORS allowed origins

            Returns:
                ApiResponse with new API key (includes full secret)

            Example:
                >>> response = client.auth.create_key(
                ...     name="My Project",
                ...     tier=ApiTier.BASIC
                ... )
                >>> print(response.data["key"])
                ddpk_live_abc123...
            """
            data = {
                "name": name,
                "tier": tier.value,
            }
            if expires_at:
                data["expiresAt"] = expires_at.isoformat()
            if allowed_origins:
                data["allowedOrigins"] = allowed_origins

            return self.client._request("POST", "/auth/keys", data=data)

        def revoke_key(self, key_id: str) -> ApiResponse:
            """
            Revoke an API key

            Args:
                key_id: API key identifier (not the key itself)

            Returns:
                Empty response on success
            """
            return self.client._request("DELETE", f"/auth/keys/{key_id}")

    @property
    def auth(self) -> AuthAPI:
        """Access Auth API"""
        return self.AuthAPI(self)


# Helper functions for common patterns

def fetch_with_retry(
    func,
    max_retries: int = 3,
    initial_delay: float = 1.0,
    backoff_factor: float = 2.0,
):
    """
    Execute a function with retry on rate limit errors

    Args:
        func: Function to execute
        max_retries: Maximum number of retries
        initial_delay: Initial delay in seconds
        backoff_factor: Multiplier for delay between retries

    Returns:
        Function result

    Raises:
        APIError: If all retries are exhausted

    Example:
        >>> client = DadDeckAPI(api_key="...")
        >>> response = fetch_with_retry(lambda: client.cards.list())
    """
    delay = initial_delay

    for attempt in range(max_retries):
        try:
            return func()
        except APIError as e:
            if e.is_rate_limit_error() and attempt < max_retries - 1:
                retry_delay = max(e.get_retry_delay() / 1000, delay)
                print(f"Rate limited. Retrying in {retry_delay:.1f}s...")
                time.sleep(retry_delay)
                delay *= backoff_factor
                continue
            raise

    raise APIError("MAX_RETRIES", "Maximum retries exceeded")


def get_all_cards(
    client: DadDeckAPI,
    filters: Optional[Dict[str, Any]] = None,
) -> List[Dict[str, Any]]:
    """
    Get all cards with automatic pagination

    Args:
        client: DadDeckAPI instance
        filters: Optional filters to apply

    Returns:
        List of all cards

    Example:
        >>> client = DadDeckAPI(api_key="...")
        >>> all_rare = get_all_cards(client, {"rarity": "rare"})
        >>> print(f"Found {len(all_rare)} rare cards")
    """
    all_cards = []
    page = 1
    has_more = True

    while has_more:
        params = {**(filters or {}), "page": page, "pageSize": 100}
        response = client.cards.list(**params)

        all_cards.extend(response.data["cards"])
        has_more = response.data["pagination"]["hasNext"]
        page += 1

    return all_cards


# Example usage
if __name__ == "__main__":
    import os

    # Initialize client
    api_key = os.environ.get("DADDECK_API_KEY", "ddpk_live_example_key")
    client = DadDeckAPI(api_key=api_key)

    # Example: List rare cards
    print("Fetching rare cards...")
    try:
        response = client.cards.list(rarity="rare", page_size=10)
        if response.success:
            cards = response.data["cards"]
            print(f"Found {response.data['pagination']['totalCards']} rare cards")
            for card in cards[:3]:
                print(f"  - {card['name']}: {card['rarity']}")
            print(f"Rate limit: {response.rate_limit.remaining}/{response.rate_limit.limit} remaining")
    except APIError as e:
        print(f"Error: {e}")

    # Example: Generate a pack
    print("\nGenerating pack...")
    try:
        response = client.packs.generate(count=1)
        if response.success:
            pack = response.data["packs"][0]
            print(f"Generated pack with {len(pack['cards'])} cards")
            print(f"Best pull: {pack['bestRarity']}")
    except APIError as e:
        print(f"Error: {e}")
