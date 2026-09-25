"""Trusted entry assembly. Never construct authority from a model/wire payload."""
from dataclasses import replace

from .context import Budget, RunContext, RunState
from .contracts import RuntimeFault


def check_session(parent, request_id, actor, audience, session):
    parent.check()
    if (parent.request_id, parent.actor, parent.audience, parent.session) != (
            request_id, actor, audience, session):
        raise RuntimeFault("session_denied")


def bind_context(policy, request_id, actor, audience, session, deadline, limits, *, parent=None):
    """Bind an entry's fixed audience/session, preserving any parent's ceiling.

    The business adapter must call this before fetching session data. Network
    identity still belongs to the trusted game connection, not this helper.
    Actual Agent entry/delegation and capacity remain Runner/adapter duties.
    """
    if parent is None:
        return RunContext(request_id, actor, audience, session, policy, deadline, Budget(limits))
    check_session(parent, request_id, actor, audience, session)
    return replace(parent, policy=parent.policy.intersect(policy),
                   deadline=min(deadline, parent.deadline), budget=Budget(limits, parent.budget),
                   state=RunState())
