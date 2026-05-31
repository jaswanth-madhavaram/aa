"""
Web medicine lookup fallback.

Uses official public sources:
- RxNav/RxNorm for normalized drug names and dose forms.
- openFDA drug labeling for brand/generic/manufacturer and label metadata.
"""
from __future__ import annotations

import logging
from dataclasses import dataclass, field
from typing import List, Optional

import requests

logger = logging.getLogger(__name__)

RXNAV_BASE = "https://rxnav.nlm.nih.gov/REST"
OPENFDA_LABEL = "https://api.fda.gov/drug/label.json"


@dataclass
class WebMedicineInfo:
    query: str
    name: str
    generic_name: str = ""
    salt_composition: str = ""
    manufacturer: str = ""
    strength: str = ""
    form: str = ""
    category: str = ""
    source: str = "web"
    source_urls: List[str] = field(default_factory=list)


def lookup_web_medicine(name: str, timeout: float = 6.0) -> Optional[WebMedicineInfo]:
    """Return public web data for a drug name, or None when not found."""
    query = (name or "").strip()
    if not query:
        return None

    rx_info = _lookup_rxnav(query, timeout=timeout)
    fda_info = _lookup_openfda(query, timeout=timeout)

    if not rx_info and not fda_info:
        return None

    if rx_info and fda_info:
        rx_info.generic_name = rx_info.generic_name or fda_info.generic_name
        rx_info.salt_composition = rx_info.salt_composition or fda_info.salt_composition
        rx_info.manufacturer = fda_info.manufacturer or rx_info.manufacturer
        rx_info.form = rx_info.form or fda_info.form
        rx_info.category = fda_info.category or rx_info.category
        rx_info.source = "RxNav + openFDA"
        rx_info.source_urls = sorted(set(rx_info.source_urls + fda_info.source_urls))
        return rx_info

    return rx_info or fda_info


def _lookup_rxnav(query: str, timeout: float) -> Optional[WebMedicineInfo]:
    try:
        response = requests.get(
            f"{RXNAV_BASE}/rxcui.json",
            params={"name": query, "search": "2"},
            timeout=timeout,
        )
        response.raise_for_status()
        ids = response.json().get("idGroup", {}).get("rxnormId", [])
        if not ids:
            return None
        rxcui = ids[0]

        prop_response = requests.get(
            f"{RXNAV_BASE}/rxcui/{rxcui}/properties.json",
            timeout=timeout,
        )
        prop_response.raise_for_status()
        props = prop_response.json().get("properties", {}) or {}

        related_response = requests.get(
            f"{RXNAV_BASE}/rxcui/{rxcui}/related.json",
            params={"tty": "IN+PIN+SCD+SBD+BN"},
            timeout=timeout,
        )
        related_response.raise_for_status()
        groups = related_response.json().get("relatedGroup", {}).get("conceptGroup", []) or []

        ingredients: List[str] = []
        dose_forms: List[str] = []
        brands: List[str] = []
        for group in groups:
            tty = group.get("tty")
            for concept in group.get("conceptProperties", []) or []:
                concept_name = concept.get("name", "")
                if tty in {"IN", "PIN"} and concept_name:
                    ingredients.append(concept_name)
                elif tty in {"SCD", "SBD"} and concept_name:
                    dose_forms.append(concept_name)
                elif tty == "BN" and concept_name:
                    brands.append(concept_name)

        display_name = props.get("name") or (brands[0] if brands else query)
        generic = _first_unique(ingredients) or display_name
        form = _infer_form(" ".join([display_name] + dose_forms))
        strength = _infer_strength(" ".join([display_name] + dose_forms))

        return WebMedicineInfo(
            query=query,
            name=display_name,
            generic_name=generic,
            salt_composition=generic if not strength else f"{generic} {strength}",
            strength=strength,
            form=form,
            category=props.get("tty", ""),
            source="RxNav",
            source_urls=[
                f"https://rxnav.nlm.nih.gov/REST/rxcui/{rxcui}/properties.json",
                f"https://mor.nlm.nih.gov/RxNav/search?searchBy=String&searchTerm={query}",
            ],
        )
    except Exception as e:
        logger.info("RxNav lookup failed for %s: %s", query, e)
        return None


def _lookup_openfda(query: str, timeout: float) -> Optional[WebMedicineInfo]:
    searches = [
        f'openfda.brand_name:"{query}"',
        f'openfda.generic_name:"{query}"',
        f'openfda.substance_name:"{query}"',
    ]
    for search in searches:
        info = _openfda_request(query, search, timeout)
        if info:
            return info
    return None


def _openfda_request(query: str, search: str, timeout: float) -> Optional[WebMedicineInfo]:
    try:
        response = requests.get(
            OPENFDA_LABEL,
            params={"search": search, "limit": 1},
            timeout=timeout,
        )
        if response.status_code == 404:
            return None
        response.raise_for_status()
        results = response.json().get("results", [])
        if not results:
            return None

        item = results[0]
        openfda = item.get("openfda", {}) or {}
        brand = _first(openfda.get("brand_name")) or query
        generic = _first(openfda.get("generic_name")) or _first(openfda.get("substance_name")) or brand
        form = _first(openfda.get("dosage_form")) or _infer_form(" ".join(item.get("dosage_forms_and_strengths", [])))
        strength = _infer_strength(" ".join(item.get("dosage_forms_and_strengths", [])))
        category = _first(openfda.get("pharm_class_epc")) or _first(openfda.get("pharm_class_moa")) or ""

        return WebMedicineInfo(
            query=query,
            name=brand,
            generic_name=generic,
            salt_composition=generic if not strength else f"{generic} {strength}",
            manufacturer=_first(openfda.get("manufacturer_name")) or "",
            strength=strength,
            form=form.title() if form else "",
            category=category,
            source="openFDA",
            source_urls=[
                f"https://api.fda.gov/drug/label.json?search={search}&limit=1",
            ],
        )
    except Exception as e:
        logger.info("openFDA lookup failed for %s: %s", query, e)
        return None


def _first(values) -> str:
    if isinstance(values, list) and values:
        return str(values[0]).strip()
    if isinstance(values, str):
        return values.strip()
    return ""


def _first_unique(values: List[str]) -> str:
    seen: set[str] = set()
    unique: List[str] = []
    for value in values:
        key = value.lower()
        if key not in seen:
            seen.add(key)
            unique.append(value)
    return " + ".join(unique)


def _infer_strength(text: str) -> str:
    import re

    strengths = re.findall(r"\b\d+(?:\.\d+)?\s*(?:mg|mcg|ml|g|iu|unit|units|%)\b", text, re.I)
    return "+".join(dict.fromkeys(s.replace(" ", "") for s in strengths))


def _infer_form(text: str) -> str:
    lowered = text.lower()
    forms = [
        "tablet",
        "capsule",
        "syrup",
        "injection",
        "solution",
        "suspension",
        "cream",
        "ointment",
        "gel",
        "spray",
        "drops",
        "patch",
    ]
    for form in forms:
        if form in lowered:
            return form.title()
    return ""
