def build_prompt(summary, profile):

    column_names = ", ".join(profile["column_name"])

    column_details = "\n".join([
        f"- {list(col.keys())[0]} | type: {list(col.values())[0]}"
        for col in profile["column_details"]
    ])

    features_text = "\n".join(
        [f"- {k}: {v}" for k, v in summary["top_features"].items()]
    )

    clusters = summary["clusters"]
    cluster_status = clusters.get("status")

    if cluster_status == "success":
        cluster_summary = clusters.get("cluster_summary", {})
        cluster_summary_text = "\n".join([
            f"Cluster {k}: {v}" for k, v in cluster_summary.items()
        ])
        cluster_text = f"""
Cluster Analysis:
Best k: {clusters.get('best_k')}
Silhouette score: {clusters.get('silhouette_score')} (strong separation)

Cluster Sizes:
{clusters.get('cluster_sizes')}

Cluster Summary:
{cluster_summary_text}
"""

    elif cluster_status == "soft":
        # Pass the caveat directly into the prompt so the LLM hedges correctly.
        cluster_summary = clusters.get("cluster_summary", {})
        cluster_summary_text = "\n".join([
            f"Cluster {k}: {v}" for k, v in cluster_summary.items()
        ])
        cluster_text = f"""
Cluster Analysis:
Best k: {clusters.get('best_k')}
Silhouette score: {clusters.get('silhouette_score')} (weak separation — soft groupings only)

Important caveat: {clusters.get('caveat')}

Cluster Sizes:
{clusters.get('cluster_sizes')}

Cluster Summary:
{cluster_summary_text}
"""

    else:
        cluster_text = f"""
Cluster Analysis:
Not applied

Reason:
{clusters.get("reason")}
"""

    prompt = f"""
You are a professional data analyst.

Generate a structured data analysis report.

Format:
1. Dataset Overview
2. Key Features
3. Cluster Analysis
4. Key Insights
5. Conclusion

Dataset:
- Rows: {summary['rows']}
- Columns: {summary['columns']}
- Numeric columns: {summary['numeric_columns']}

Column Names:
{column_names}

Column Details:
{column_details}
"""

    prompt += f"""
Correlation Analysis:

Top Pearson (linear relationships):
{pearson_text}

Top Spearman (rank relationships):
{spearman_text}
"""

    if summary["mode"] == "ml":
        prompt += f"""
Target Column:
{summary['target']}

Top Features:
{features_text}
"""
    else:
        prompt += """
No target column.

Focus on patterns and relationships.
"""

    prompt += cluster_text

    prompt += """
Instructions:
- Use simple English
- No conversational text
- Use bullet points
- Use real column names
- For soft/weak cluster results, describe groups as tendencies or broad patterns, not hard segments
"""

    return prompt