def build_prompt(summary, profile):

    column_names = ", ".join(profile.get("column_name", []))

    column_details_list = profile.get("column_details", [])
    if column_details_list and isinstance(column_details_list[0], dict) and "error" in column_details_list[0]:
        column_details = "- Error: Profiling failed for this dataset."
    else:
        column_details = "\n".join([
            f"- {list(col.keys())[0]} | type: {list(col.values())[0]}"
            for col in column_details_list if isinstance(col, dict) and col
        ])

    top_features = summary.get("top_features")
    if top_features:
        features_text = "\n".join(
            [f"- {k}: {v}" for k, v in top_features.items()]
        )
    else:
        features_text = "Not available (correlation analysis skipped or failed)."

    pearson_data = summary.get("top_pearson")
    pearson_text = "\n".join([
        f"- {a} & {b}: {round(v, 2)}"
        for a, b, v in pearson_data
    ]) if pearson_data else "Not applied or failed."

    spearman_data = summary.get("top_spearman")
    spearman_text = "\n".join([
        f"- {a} & {b}: {round(v, 2)}"
        for a, b, v in spearman_data
    ]) if spearman_data else "Not applied or failed."

    clusters = summary.get("clusters", {})
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
{clusters.get("reason", "Analysis failed or was skipped.")}
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
- Rows: {summary.get('rows', 'Unknown')}
- Columns: {summary.get('columns', 'Unknown')}
- Numeric columns: {summary.get('numeric_columns', 'Unknown')}

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