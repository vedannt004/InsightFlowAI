from flask import Flask, request, jsonify
import pandas as pd
import numpy as np
from sklearn.linear_model import LinearRegression
from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler
import json
from datetime import datetime, timedelta

app = Flask(__name__)


@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "healthy", "service": "InsightFlow Python Services"})


@app.route("/clean", methods=["POST"])
def clean_data():
    """Clean uploaded sales data."""
    try:
        data = request.json.get("data", [])
        df = pd.DataFrame(data)

        if df.empty:
            return jsonify({"error": "No data provided", "cleaned": []}), 400

        # Remove duplicates
        original_len = len(df)
        df = df.drop_duplicates()

        # Handle missing values
        numeric_cols = ["quantity", "price", "revenue"]
        for col in numeric_cols:
            if col in df.columns:
                df[col] = pd.to_numeric(df[col], errors="coerce").fillna(0)

        # Normalize dates
        if "date" in df.columns:
            df["date"] = pd.to_datetime(df["date"], errors="coerce")
            df["date"] = df["date"].fillna(pd.Timestamp.now())

        # Fill missing strings
        string_cols = ["product_name", "category", "customer_id"]
        for col in string_cols:
            if col in df.columns:
                df[col] = df[col].fillna("Unknown")

        # Calculate revenue if missing
        if "revenue" in df.columns and "quantity" in df.columns and "price" in df.columns:
            mask = df["revenue"] == 0
            df.loc[mask, "revenue"] = df.loc[mask, "quantity"] * df.loc[mask, "price"]

        cleaned = df.to_dict(orient="records")
        for r in cleaned:
            if isinstance(r.get("date"), pd.Timestamp):
                r["date"] = r["date"].isoformat()

        return jsonify({
            "cleaned": cleaned,
            "stats": {
                "original_count": original_len,
                "cleaned_count": len(cleaned),
                "duplicates_removed": original_len - len(df),
            }
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/forecast", methods=["POST"])
def forecast():
    """Generate sales forecast using Linear Regression."""
    try:
        data = request.json.get("monthly_data", [])
        months_ahead = request.json.get("months_ahead", 3)

        if len(data) < 2:
            return jsonify({"error": "Need at least 2 months of data", "forecast": []}), 400

        revenues = [d["revenue"] for d in data]
        X = np.arange(len(revenues)).reshape(-1, 1)
        y = np.array(revenues)

        # Linear Regression
        model = LinearRegression()
        model.fit(X, y)
        r2 = model.score(X, y)

        forecast_results = []
        last_month = data[-1].get("month", "2025-01")

        for i in range(1, months_ahead + 1):
            pred = max(0, model.predict([[len(revenues) - 1 + i]])[0])
            confidence = max(0.3, min(0.95, r2 * (1 - i * 0.1)))

            # Calculate next month string
            parts = last_month.split("-")
            year, month = int(parts[0]), int(parts[1]) + i
            while month > 12:
                month -= 12
                year += 1

            forecast_results.append({
                "month": f"{year}-{str(month).zfill(2)}",
                "predicted_sales": round(pred, 2),
                "confidence_score": round(confidence, 3),
                "model": "Linear Regression",
            })

        return jsonify({
            "forecast": forecast_results,
            "model_metrics": {
                "r_squared": round(r2, 4),
                "slope": round(float(model.coef_[0]), 2),
                "intercept": round(float(model.intercept_), 2),
            }
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/segment", methods=["POST"])
def segment_customers():
    """Segment customers using K-Means clustering."""
    try:
        data = request.json.get("customers", [])
        k = request.json.get("clusters", 3)

        if len(data) < k:
            return jsonify({"error": f"Need at least {k} customers", "segments": []}), 400

        df = pd.DataFrame(data)
        features = df[["purchase_count", "total_spent", "avg_order_value"]].values

        # Standardize
        scaler = StandardScaler()
        scaled = scaler.fit_transform(features)

        # K-Means
        kmeans = KMeans(n_clusters=k, random_state=42, n_init=10)
        df["cluster"] = kmeans.fit_predict(scaled)

        # Label clusters
        cluster_stats = df.groupby("cluster").agg({
            "purchase_count": "mean",
            "total_spent": "mean",
            "avg_order_value": "mean",
        }).reset_index()

        labels = {}
        sorted_by_freq = cluster_stats.sort_values("purchase_count", ascending=False)
        label_names = ["Loyal Customers", "High Spenders", "Occasional Buyers"]
        for i, (_, row) in enumerate(sorted_by_freq.iterrows()):
            labels[int(row["cluster"])] = label_names[min(i, len(label_names) - 1)]

        df["segment"] = df["cluster"].map(labels)

        return jsonify({
            "customers": df.to_dict(orient="records"),
            "cluster_centers": kmeans.cluster_centers_.tolist(),
            "inertia": round(float(kmeans.inertia_), 2),
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/recommend", methods=["POST"])
def recommend():
    """Generate AI recommendations based on sales data."""
    try:
        data = request.json
        products = data.get("products", [])
        monthly = data.get("monthly_revenue", [])

        recommendations = []

        if products:
            avg_revenue = np.mean([p["revenue"] for p in products])

            # Slow sellers
            slow = [p for p in products if p["revenue"] < avg_revenue * 0.5]
            if slow:
                recommendations.append({
                    "type": "promotion",
                    "priority": "high",
                    "title": "Promote Slow-Selling Products",
                    "description": f"{len(slow)} products are underperforming",
                    "products": [p["name"] for p in slow[:3]],
                })

            # High demand
            high = [p for p in products if p["revenue"] > avg_revenue * 1.5]
            if high:
                recommendations.append({
                    "type": "inventory",
                    "priority": "high",
                    "title": "Increase Stock for High-Demand Products",
                    "description": f"{len(high)} products have exceptional demand",
                    "products": [p["name"] for p in high[:3]],
                })

        if len(monthly) >= 2:
            growth = (monthly[-1] - monthly[-2]) / monthly[-2] * 100 if monthly[-2] > 0 else 0
            if growth < 0:
                recommendations.append({
                    "type": "growth",
                    "priority": "critical",
                    "title": "Revenue Declining",
                    "description": f"Revenue dropped by {abs(round(growth, 1))}%",
                })

        return jsonify({"recommendations": recommendations})

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/health-score", methods=["POST"])
def health_score():
    """Calculate business health score."""
    try:
        data = request.json
        sales_growth = data.get("sales_growth", 0)
        retention_rate = data.get("retention_rate", 0)
        product_performance = data.get("product_performance", 0)
        consistency = data.get("consistency", 50)

        score = (
            sales_growth * 0.3
            + retention_rate * 0.25
            + product_performance * 0.25
            + consistency * 0.2
        )
        score = max(0, min(100, round(score)))

        grade = "F"
        if score >= 90: grade = "A+"
        elif score >= 80: grade = "A"
        elif score >= 70: grade = "B"
        elif score >= 60: grade = "C"
        elif score >= 50: grade = "D"

        return jsonify({"score": score, "grade": grade})

    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    print("🚀 InsightFlow Python Services starting on port 5001...")
    app.run(host="0.0.0.0", port=5001, debug=True)
