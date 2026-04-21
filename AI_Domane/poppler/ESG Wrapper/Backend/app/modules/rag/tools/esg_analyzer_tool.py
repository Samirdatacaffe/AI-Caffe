"""
ESG Analyzer Tool — callable by the agentic layer.

Analyses a query against known ESG standards and returns
structured guidance about which standards, sections, and
procedures apply. This is rule-based (no LLM call), so it's
fast and deterministic.
"""

from app.utils.logger import logger

# ── ESG Standards Knowledge Map ─────────────────────────
# Maps keywords → relevant standards and guidance

_ESG_RULES = {
    "ghg": {
        "standards": ["ISAE 3410", "GHG Protocol"],
        "guidance": (
            "GHG emissions assurance must follow ISAE 3410. "
            "Verify Scope 1/2/3 boundaries, emission factors (IPCC/DEFRA), "
            "GWP values, and organisational vs operational control approach. "
            "Materiality threshold: typically 5% of total reported emissions."
        ),
    },
    "brsr": {
        "standards": ["SEBI BRSR", "ICAI Technical Guide"],
        "guidance": (
            "BRSR assurance covers the BRSR Core KPIs mandated by SEBI. "
            "Top 150 listed companies require mandatory assurance from FY 2023-24. "
            "Key KPIs: GHG emissions, energy consumption, water usage, "
            "waste generation, gender diversity, and employee turnover."
        ),
    },
    "materiality": {
        "standards": ["ISAE 3000", "ISSA 5000", "AA1000AS"],
        "guidance": (
            "Materiality in ESG assurance is both quantitative and qualitative. "
            "Thresholds: GHG ~5%, headcount ~1-2%, financial CSR ~2%. "
            "Double materiality (CSRD/ISSA 5000) requires assessing both "
            "impact materiality and financial materiality."
        ),
    },
    "assurance": {
        "standards": ["ISAE 3000 (Revised)", "ISSA 5000"],
        "guidance": (
            "ISAE 3000 is the primary standard for non-financial assurance. "
            "Two levels: limited (negative form conclusion) and reasonable "
            "(positive form, higher evidence threshold). "
            "ISSA 5000 is the new global sustainability assurance standard (2024)."
        ),
    },
    "social": {
        "standards": ["ISAE 3000", "GRI 401-405", "BRSR Principle 3/5"],
        "guidance": (
            "Social KPIs include workforce diversity, employee turnover, "
            "health & safety (LTIFR), training hours, and human rights due diligence. "
            "Verify against HR/payroll records, incident registers, and training logs."
        ),
    },
    "governance": {
        "standards": ["ISAE 3000", "BRSR Principle 1"],
        "guidance": (
            "Governance assurance covers board composition, anti-bribery policies, "
            "regulatory compliance, whistleblower mechanisms, and ESG oversight. "
            "Verify through board minutes, policy documents, and compliance certificates."
        ),
    },
    "water": {
        "standards": ["ISAE 3000", "GRI 303", "BRSR Core"],
        "guidance": (
            "Water assurance covers withdrawal, consumption, and discharge by source. "
            "Verify via meter readings, water bills, and treatment plant records. "
            "Materiality threshold: typically 5% of total reported volume."
        ),
    },
    "energy": {
        "standards": ["ISAE 3000", "GRI 302", "BRSR Core"],
        "guidance": (
            "Energy assurance covers total consumption, renewable vs non-renewable split, "
            "and energy intensity. Verify via utility bills, meter data, fuel purchase records."
        ),
    },
    "waste": {
        "standards": ["ISAE 3000", "GRI 306", "BRSR Core"],
        "guidance": (
            "Waste assurance covers generation, diversion, and disposal methods. "
            "Verify via waste manifests, recycler certificates, and landfill records."
        ),
    },
}


class ESGAnalyzerTool:
    """Tool: identify applicable ESG standards and procedures for a query."""

    name = "esg_analyzer"
    description = (
        "Analyse a query to identify which ESG standards, frameworks, "
        "and assurance procedures are relevant. Returns structured guidance."
    )

    def run(self, query: str) -> str:
        """Match query against ESG rules and return applicable guidance."""
        logger.info(f"ESGAnalyzerTool.run() — query={query[:80]}")

        query_lower = query.lower()
        matches = []

        for keyword, info in _ESG_RULES.items():
            if keyword in query_lower:
                standards = ", ".join(info["standards"])
                matches.append(
                    f"**Applicable Standards:** {standards}\n"
                    f"**Guidance:** {info['guidance']}"
                )

        if not matches:
            # Default fallback — still useful
            return (
                "No specific ESG standard match found for this query. "
                "General guidance: refer to ISAE 3000 (Revised) for non-financial "
                "assurance engagements, BRSR Core for India-listed entities, "
                "and ISSA 5000 for the latest global sustainability standard."
            )

        result = "\n\n".join(matches)
        logger.info(f"ESGAnalyzerTool: {len(matches)} rule(s) matched")
        return result
