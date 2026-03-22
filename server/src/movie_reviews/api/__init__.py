from .account import register_routes as account_routes
from .activity import register_routes as activity_routes
from .comments import register_routes as comments_routes
from .core import register_routes as core_routes
from .documents import register_routes as document_routes
from .likes import register_routes as likes_routes
from .notifications import register_routes as notifications_routes
from .version import register_routes as version_routes

ROUTE_MODULES = [
    account_routes,
    document_routes,
    core_routes,
    comments_routes,
    likes_routes,
    notifications_routes,
    activity_routes,
    version_routes,
]
