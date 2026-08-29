import io
import os
from datetime import date, datetime
from decimal import Decimal

import psycopg
from dotenv import load_dotenv
from flask import Flask, jsonify, redirect, render_template, request, send_file
from psycopg.rows import dict_row
from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.platypus import Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle


load_dotenv()

app = Flask(__name__)


def get_db_connection():
    database_url = os.getenv("DATABASE_URL")

    if database_url:
        return psycopg.connect(database_url, row_factory=dict_row)

    return psycopg.connect(
        host=os.getenv("DB_HOST", "localhost"),
        port=os.getenv("DB_PORT", "5432"),
        dbname=os.getenv("DB_NAME", "greentrack"),
        user=os.getenv("DB_USER", "postgres"),
        password=os.getenv("DB_PASSWORD", ""),
        row_factory=dict_row,
    )


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/login")
def login():
    return render_template("login.html")


@app.route("/energy")
def energy():
    return render_template("energy.html")


@app.route("/water")
def water():
    return render_template("water.html")


@app.route("/waste")
def waste():
    return render_template("waste.html")


@app.route("/reports")
def reports():
    return render_template("reports.html")


@app.route("/upload")
def upload():
    role = request.cookies.get("greenTrackRole", "").strip().lower()
    if role not in {"admin", "staff"}:
        return redirect("/")
    return render_template("upload.html")


def parse_environmental_data(data):
    building_name = str(data.get("building", "")).strip()
    category_name = str(data.get("category", "")).strip()
    date_recorded = str(
        data.get("date", data.get("dateRecorded", data.get("daterecorded", "")))
    ).strip()
    reading_value = data.get("reading", "")
    unit = str(data.get("unit", "")).strip()

    if not building_name or not category_name or not date_recorded or not unit:
        return None, "All fields are required."

    if category_name not in {"Energy", "Water", "Waste"}:
        return None, "Category must be Energy, Water, or Waste."

    try:
        reading = float(reading_value)
    except (TypeError, ValueError):
        return None, "Reading must be numeric."

    if reading < 0:
        return None, "Reading cannot be negative."

    try:
        recorded_date = date.fromisoformat(date_recorded)
    except ValueError:
        return None, "DateRecorded must be a valid date."

    return {
        "building": building_name,
        "category": category_name,
        "date": recorded_date,
        "reading": reading,
        "unit": unit,
    }, None


def editor_required():
    role = request.headers.get("X-GreenTrack-Role", "").strip().lower()
    if role not in {"admin", "staff"}:
        return jsonify({
            "error": "Only Admin and Sustainability Staff can modify data."
        }), 403
    return None


def fetch_environmental_records():
    with get_db_connection() as connection:
        with connection.cursor() as cursor:
            cursor.execute(
                '''
                SELECT
                e.dataid,
                b.buildingname,
                c.categoryname,
                e.daterecorded,
                e.reading,
                e.unit
                FROM environmentaldata e
                JOIN buildings b ON e.buildingid = b.buildingid
                JOIN categories c ON e.categoryid = c.categoryid;
                '''
            )
            rows = cursor.fetchall()

    records = []
    for row in rows:
        recorded_date = row["daterecorded"]
        reading = row["reading"]
        records.append({
            "dataid": row["dataid"],
            "buildingname": row["buildingname"],
            "categoryname": row["categoryname"],
            "daterecorded": (
                recorded_date.isoformat()
                if isinstance(recorded_date, (date, datetime))
                else recorded_date
            ),
            "reading": float(reading) if isinstance(reading, Decimal) else reading,
            "unit": row["unit"],
        })
    return records


@app.get("/api/environmental-data")
def get_environmental_data():
    try:
        return jsonify(fetch_environmental_records())
    except psycopg.Error as error:
        app.logger.exception(
            "Unable to read environmentaldata from PostgreSQL: %s", error
        )
        return jsonify({
            "error": "Unable to read EnvironmentalData from PostgreSQL."
        }), 500


def _filter_records_for_report(records, category, period):
    filtered = records
    if category and category != "All":
        filtered = [r for r in filtered if r["categoryname"] == category]
    if period and period != "All":
        filtered = [r for r in filtered if str(r["daterecorded"]).startswith(period)]
    return filtered


@app.get("/api/reports/pdf")
def export_report_pdf():
    category = request.args.get("category", "All").strip() or "All"
    period = request.args.get("period", "All").strip() or "All"

    if category not in {"All", "Energy", "Water", "Waste"}:
        return jsonify({"error": "Invalid report category."}), 400

    try:
        records = fetch_environmental_records()
    except psycopg.Error:
        app.logger.exception("Unable to read environmentaldata from PostgreSQL")
        return jsonify({
            "error": "Unable to read EnvironmentalData from PostgreSQL."
        }), 500

    filtered = _filter_records_for_report(records, category, period)

    unit_by_category = {"Energy": "kWh", "Water": "gal", "Waste": "lbs"}

    building_totals = {}
    for record in filtered:
        building_totals[record["buildingname"]] = (
            building_totals.get(record["buildingname"], 0) + float(record["reading"] or 0)
        )
    total_usage = sum(building_totals.values())

    buffer = io.BytesIO()
    document = SimpleDocTemplate(buffer, pagesize=letter, title="GreenTrack Sustainability Report")
    styles = getSampleStyleSheet()
    story = [
        Paragraph("GreenTrack Sustainability Report", styles["Title"]),
        Spacer(1, 10),
        Paragraph(f"Report Category: {category}", styles["Normal"]),
        Paragraph(f"Reporting Period: {period}", styles["Normal"]),
        Paragraph(f"Date Generated: {date.today().isoformat()}", styles["Normal"]),
        Paragraph(f"Total Records: {len(filtered)}", styles["Normal"]),
    ]

    if category in unit_by_category:
        story.append(Paragraph(
            f"Total {category} Usage: {total_usage:,.2f} {unit_by_category[category]}",
            styles["Normal"],
        ))

    story.append(Spacer(1, 16))
    story.append(Paragraph("Breakdown by Building", styles["Heading2"]))

    building_rows = [["Building", "Total Reading"]]
    for building, total in sorted(building_totals.items(), key=lambda item: item[1], reverse=True):
        building_rows.append([building, f"{total:,.2f}"])
    if len(building_rows) == 1:
        building_rows.append(["No records available", ""])

    building_table = Table(building_rows, hAlign="LEFT", colWidths=[300, 150])
    building_table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#2E7D32")),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
        ("GRID", (0, 0), (-1, -1), 0.5, colors.grey),
        ("FONTSIZE", (0, 0), (-1, -1), 9),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, colors.HexColor("#f5f5f5")]),
    ]))
    story.append(building_table)
    story.append(Spacer(1, 16))

    story.append(Paragraph("Record Detail", styles["Heading2"]))
    detail_rows = [["Building", "Category", "Date", "Reading", "Unit"]]
    for record in sorted(filtered, key=lambda r: str(r["daterecorded"]), reverse=True)[:200]:
        detail_rows.append([
            record["buildingname"],
            record["categoryname"],
            record["daterecorded"],
            f"{float(record['reading'] or 0):,.2f}",
            record["unit"],
        ])
    if len(detail_rows) == 1:
        detail_rows.append(["No records available", "", "", "", ""])

    detail_table = Table(detail_rows, hAlign="LEFT", repeatRows=1)
    detail_table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#2E7D32")),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
        ("GRID", (0, 0), (-1, -1), 0.5, colors.grey),
        ("FONTSIZE", (0, 0), (-1, -1), 8),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, colors.HexColor("#f5f5f5")]),
    ]))
    story.append(detail_table)

    document.build(story)
    buffer.seek(0)

    filename = f"greentrack-{category.lower()}-report.pdf"
    return send_file(
        buffer,
        mimetype="application/pdf",
        as_attachment=True,
        download_name=filename,
    )


@app.route("/api/environmental-data", methods=["POST"])
def create_environmental_data():
    data, error = parse_environmental_data(request.get_json(silent=True) or {})
    if error:
        return jsonify({"error": error}), 400

    connection = None
    try:
        connection = get_db_connection()
        with connection.cursor() as cursor:
            cursor.execute(
                """
                SELECT buildingid
                FROM buildings
                WHERE buildingname = %s;
                """,
                (data["building"],),
            )
            building = cursor.fetchone()

            if not building:
                connection.rollback()
                return jsonify({"error": "Building does not exist."}), 400

            cursor.execute(
                """
                SELECT categoryid
                FROM categories
                WHERE categoryname = %s;
                """,
                (data["category"],),
            )
            category = cursor.fetchone()

            if not category:
                connection.rollback()
                return jsonify({"error": "Category does not exist."}), 400

            cursor.execute(
                """
                INSERT INTO environmentaldata
                    (buildingid, categoryid, daterecorded, reading, unit)
                VALUES (%s, %s, %s, %s, %s)
                RETURNING dataid;
                """,
                (
                    building["buildingid"],
                    category["categoryid"],
                    data["date"],
                    data["reading"],
                    data["unit"],
                ),
            )
            record = cursor.fetchone()
        connection.commit()

        return jsonify({
            "success": True,
            "message": "Environmental data saved successfully.",
            "dataid": record["dataid"],
        }), 201
    except psycopg.Error as error:
        if connection is not None:
            connection.rollback()
        print(
            "Unable to save environmentaldata to PostgreSQL:",
            repr(error),
            flush=True,
        )
        app.logger.exception("Unable to save environmentaldata to PostgreSQL")
        return jsonify({
            "error": "Unable to save environmental data."
        }), 500
    finally:
        if connection is not None:
            connection.close()


@app.put("/api/environmental-data/<int:data_id>")
def update_environmental_data(data_id):
    authorization_error = editor_required()
    if authorization_error:
        return authorization_error

    data, error = parse_environmental_data(request.get_json(silent=True) or {})
    if error:
        return jsonify({"error": error}), 400

    try:
        with get_db_connection() as connection:
            with connection.cursor() as cursor:
                cursor.execute(
                    """
                    SELECT buildingid
                    FROM buildings
                    WHERE buildingname = %s;
                    """,
                    (data["building"],),
                )
                building = cursor.fetchone()
                if not building:
                    return jsonify({"error": "Building does not exist."}), 400

                cursor.execute(
                    """
                    SELECT categoryid
                    FROM categories
                    WHERE categoryname = %s;
                    """,
                    (data["category"],),
                )
                category = cursor.fetchone()
                if not category:
                    return jsonify({"error": "Category does not exist."}), 400

                cursor.execute(
                    """
                    UPDATE environmentaldata
                    SET buildingid = %s,
                        categoryid = %s,
                        daterecorded = %s,
                        reading = %s,
                        unit = %s
                    WHERE dataid = %s
                    RETURNING dataid;
                    """,
                    (
                        building["buildingid"],
                        category["categoryid"],
                        data["date"],
                        data["reading"],
                        data["unit"],
                        data_id,
                    ),
                )
                record = cursor.fetchone()

                if not record:
                    return jsonify({"error": "Environmental record not found."}), 404

        return jsonify({
            "success": True,
            "message": "Environmental data updated successfully.",
            "dataid": record["dataid"],
        })
    except psycopg.Error:
        app.logger.exception("Unable to update environmentaldata in PostgreSQL")
        return jsonify({
            "error": "Unable to update environmental data."
        }), 500


@app.delete("/api/environmental-data/<int:data_id>")
def delete_environmental_data(data_id):
    authorization_error = editor_required()
    if authorization_error:
        return authorization_error

    try:
        with get_db_connection() as connection:
            with connection.cursor() as cursor:
                cursor.execute(
                    """
                    DELETE FROM environmentaldata
                    WHERE dataid = %s
                    RETURNING dataid;
                    """,
                    (data_id,),
                )
                record = cursor.fetchone()

                if not record:
                    return jsonify({"error": "Environmental record not found."}), 404

        return jsonify({
            "success": True,
            "message": "Environmental data deleted successfully.",
            "dataid": record["dataid"],
        })
    except psycopg.Error:
        app.logger.exception("Unable to delete environmentaldata from PostgreSQL")
        return jsonify({
            "error": "Unable to delete environmental data."
        }), 500


if __name__ == "__main__":
    app.run(debug=True)