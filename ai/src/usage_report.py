"""Local diagnostic cost estimates, never a spending limit or provider invoice."""
import math


def validate_prices(prices, currency):
    if not isinstance(currency, str) or not currency.strip() or len(currency) > 16:
        raise ValueError("COST_CURRENCY must be a short currency label")
    if not isinstance(prices, dict):
        raise ValueError("MODEL_PRICES_PER_MILLION must be a JSON object")
    for binding, rates in prices.items():
        if (not isinstance(binding, str) or ":" not in binding or len(binding) > 160
                or binding.split(":", 1)[0] not in ("chat", "embedding", "rerank")
                or not binding.split(":", 1)[1] or not isinstance(rates, dict)
                or not rates or set(rates) - {"input", "cached_input", "output"}):
            raise ValueError("Invalid model price binding")
        if any(type(rate) not in (int, float) or not math.isfinite(rate) or rate < 0
               for rate in rates.values()):
            raise ValueError("Model prices must be finite, non-negative numbers")


def plain(value):
    """Copy frozen diagnostic metadata without serializing live runtime objects."""
    if hasattr(value, "items"):
        return {key: plain(item) for key, item in value.items()}
    if isinstance(value, (tuple, list)):
        return [plain(item) for item in value]
    return value


def usage_report(snapshots, prices=None, currency="CNY", *, successful_tasks=None):
    """Sum disjoint ledgers only: never include both a parent and its children.

    Unknown usage/pricing makes the total unknown, not zero. The known subtotal
    includes only fully priceable groups. No pricing table means no cost claim.
    """
    prices = prices or {}
    validate_prices(prices, currency)
    if hasattr(snapshots, "items"):
        snapshots = [snapshots]
    groups = {}
    for snapshot in snapshots:
        for row in snapshot.get("usage_groups", ()):
            key = tuple(row[name] for name in ("agent", "role", "operation", "kind", "model"))
            if key not in groups:
                groups[key] = plain(row)
            else:
                target = groups[key]
                target["calls"] += row["calls"]
                for name in ("usage", "unknown", "statuses"):
                    for field, amount in row[name].items():
                        target[name][field] = target[name].get(field, 0) + amount
    subtotal, unknown_calls = 0.0, 0
    for row in groups.values():
        rates = prices.get(row["kind"] + ":" + row["model"], {})
        usage, unknown = row["usage"], row["unknown"]
        reason, estimate = "", None
        if "input" not in rates or (row["kind"] == "chat" and "output" not in rates):
            reason = "price_unconfigured"
        elif unknown["prompt_tokens"] or unknown["completion_tokens"]:
            reason = "usage_unknown"
        elif (rates.get("cached_input", rates["input"]) != rates["input"]
              and unknown["cached_prompt_tokens"] and usage["prompt_tokens"]):
            reason = "cached_usage_unknown"
        else:
            cached = usage["cached_prompt_tokens"]
            estimate = ((usage["prompt_tokens"] - cached) * rates["input"]
                        + cached * rates.get("cached_input", rates["input"])
                        + usage["completion_tokens"] * rates.get("output", 0)) / 1000000
            subtotal += estimate
        row.update(estimated_cost=estimate, cost_unknown_reason=reason, rates_per_million=dict(rates))
        if reason:
            unknown_calls += row["calls"]
    total = subtotal if not unknown_calls else None
    return {"currency": currency, "basis": "configured_prices_per_million_tokens",
            "groups": list(groups.values()), "known_cost_subtotal": subtotal,
            "cost_unknown_calls": unknown_calls, "estimated_total_cost": total,
            "successful_tasks": successful_tasks,
            # Include failed attempts in a batch's cost per successful task.
            "cost_per_successful_task": total / successful_tasks
            if total is not None and successful_tasks else None}
