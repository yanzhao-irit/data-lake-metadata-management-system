# Example Metadata database

This Neo4j database contains examples of metadata that you can download to test the application. This database respects the metadata model proposed by Yan ZHAO.

## Stored Metadata

In this database, we ingseted metadata of datasets, processes and analyses.

- **Data**
    - [MIMIC database](https://mimic.physionet.org/): a freely accessible critical care database.
    - OMOP database: a database whose data source is the MIMIC database and it respects the [OMOP CDM](https://www.ohdsi.org/data-standardization/the-common-data-model/).
    - [Community Health Status Indicators (CHSI) to Combat Obesity, Heart Disease and Cancer](https://healthdata.gov/dataset/community-health-status-indicators-chsi-combat-obesity-heart-disease-and-cancer): health indicators for each of the 3,141 United States counties.
    - [Fetal Health Classification](https://www.kaggle.com/andrewmvd/fetal-health-classification): classify the health of a fetus as Normal, Suspect or Pathological using CTG data. ([Ayres de Campos et al. (2000) SisPorto 2.0 A Program for Automated Analysis of Cardiotocograms. J Matern Fetal Med 5:311-318](https://onlinelibrary.wiley.com/doi/10.1002/1520-6661(200009/10)9:5%3C311::AID-MFM12%3E3.0.CO;2-9))
    - [Lung Cancer DataSet](https://www.kaggle.com/yusufdede/lung-cancer-dataset): lung cancer dataset with four indicators.
    - [Breast Cancer Wisconsin (Diagnostic) Data Set](https://www.kaggle.com/uciml/breast-cancer-wisconsin-data): Predict whether the cancer is benign or malignant. (Dataset owner: UCI Machine Learning, License: [CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/))
    - [COVID-19 World Vaccination Progress](https://www.kaggle.com/gpreda/covid-world-vaccination-progress): Daily and Total Vaccination for COVID-19 in the World. (Dataset owner: Gabriel Preda, License: [CC0: Public Domain](https://creativecommons.org/publicdomain/zero/1.0/))
    - [Chest X-Ray Images (Pneumonia)](https://www.kaggle.com/paultimothymooney/chest-xray-pneumonia): Chest X-ray images (anterior-posterior) selected from retrospective cohorts of pediatric patients of one to five years old from Guangzhou Women and Children’s Medical Center ([Dataset source](https://data.mendeley.com/datasets/rscbjbr9sj/2) , License: [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/))


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

