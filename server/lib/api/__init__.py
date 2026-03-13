from .account import register_routes as account_routes
from .documents import register_routes as document_routes
from .core import register_routes as core_routes
from .comments import register_routes as comments_routes

ROUTE_MODULES = [
    account_routes,
    document_routes,
    core_routes,
    comments_routes,
]