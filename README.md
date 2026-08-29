# GreenTrack

GreenTrack is a campus sustainability dashboard created for my IT299 Integrative Project. The application provides a centralized platform for tracking, managing, and visualizing environmental data related to campus energy, water, and waste.

The project combines a Flask web application with a PostgreSQL database to provide data-driven dashboards, environmental data management, CSV uploads, reporting, and role-based access.

## Features

- Campus sustainability dashboard with energy, water, and waste summaries
- Interactive data visualizations using PostgreSQL data
- Individual Energy, Water, and Waste dashboards
- Building-level environmental data analysis
- CSV data uploads for energy, water, and waste records
- Environmental record editing and deletion
- Filtering and sorting of environmental records
- Sustainability report filtering
- CSV and PDF report exports
- Role-based access for Admin, Staff, Student, and Faculty users
- Modern and responsive dashboard interface

## Technologies Used

- Python
- Flask
- PostgreSQL
- HTML
- CSS
- JavaScript
- Chart.js

## Project Structure

```text
GreenTrack/
├── data/
├── static/
│   ├── css/
│   └── js/
├── templates/
│   ├── energy.html
│   ├── index.html
│   ├── login.html
│   ├── reports.html
│   ├── upload.html
│   ├── waste.html
│   └── water.html
├── app.py
├── requirements.txt
└── README.md
```

## Dashboard

The main dashboard provides an overview of campus sustainability data. Energy, water, and waste information is retrieved from PostgreSQL and displayed through summary cards, charts, and environmental records.

The visualizations use a consistent color system:

- Energy — Pastel Yellow
- Water — Light Blue
- Waste — Soft Peach
- Green — Primary interface accent

## Environmental Data Management

Authorized users can upload environmental data using CSV files. GreenTrack supports separate uploads for:

- Energy consumption data in kWh
- Water consumption data in gallons
- Waste management data in pounds

Environmental records can also be filtered, sorted, edited, and deleted through the application.

## Reports

The Sustainability Reports page allows users to review environmental data by category and reporting period.

Reports can be exported as:

- CSV
- PDF

Report information is generated from the environmental data stored in PostgreSQL.

## Role-Based Access

GreenTrack uses role-based access to control application features.

### Admin and Staff

- View sustainability dashboards
- Upload environmental data
- Edit records
- Delete records
- Generate reports

### Student and Faculty

- View sustainability dashboards
- View environmental information
- Read-only access to environmental data

## Demo Login Credentials

The following demo accounts can be used to test GreenTrack's role-based access:

| Role | Email | Password |
| --- | --- | --- |
| Admin | admin@greentrack.edu | admin123 |
| Staff | staff@greentrack.edu | staff123 |
| Student | student@greentrack.edu | student123 |
| Faculty | faculty@greentrack.edu | faculty123 |

> **Note:** These credentials are for demonstration purposes only and do not represent real user accounts or sensitive information.

## Database

GreenTrack uses PostgreSQL to store environmental information for campus buildings.

The application tracks:

- Building
- Environmental category
- Date recorded
- Reading
- Unit

The three primary environmental categories are Energy, Water, and Waste.

## Purpose

GreenTrack was developed to address a campus sustainability reporting problem where environmental data for energy, water, and waste was managed across separate spreadsheets. This made it difficult to maintain consistent records, compare historical data, monitor sustainability performance, and create accurate reports.

The project focused on designing a centralized solution that allows users to view environmental data, monitor trends, manage records, and generate reports from one system.

## Author

**Carmen Montoya**

Information Technology Student
