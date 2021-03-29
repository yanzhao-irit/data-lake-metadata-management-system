# Example Metadata database

This Neo4j database contains examples of metadata that you can download to test the application. This database respects the metadata model proposed by Yan ZHAO.

## Stored Metadata

In this database, we ingseted metadata of datasets, processes and analyses.

- **Data**
    - [MIMIC database](https://mimic.physionet.org/): a freely accessible critical care database.
    - OMOP database: a database whose data source is the MIMIC database and it respects the [OMOP CDM](https://www.ohdsi.org/data-standardization/the-common-data-model/).
    - [Community Health Status Indicators (CHSI) to Combat Obesity, Heart Disease and Cancer](https://healthdata.gov/dataset/community-health-status-indicators-chsi-combat-obesity-heart-disease-and-cancer): health indicators for each of the 3,141 United States counties.
- **Preparation processes**
    - [MIT-LCP MIMIC-OMOP](https://github.com/MIT-LCP/mimic-omop) transforms MIMIC data to OMOP CDM.
    - [Castor](https://github.com/OHDSI/Castor) prepares OMOP format data for time series analysis.
    - [Argos](https://github.com/OHDSI/Argos) assessess the trends in incidence and outcome of the user-defined condition based on OMOP-CDM.
- **Analyses**
    - Local cancer study, used data are three datasets extracted from the CHSI dataset, applied algorithms or landmarkers.

## Getting started with the data

1. This database is a Neo4j database, make sure that Neo4j is installed in your computer.
2. Start Neo4j application, create a new project/database with name and password.
3. Start the database and open the folder where the database is stored.
4. Download *all.cypher* file and run the script in *\bin\cypher-shell.bat*.
