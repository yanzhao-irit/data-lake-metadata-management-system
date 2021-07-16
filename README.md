
# Data Lake Metadata Management System

Data lake management aims to improve the Findability, Accessibility, Interoperatability and Reuability of data, data preparation processes and analyses that are stored in a data lake.

## Data lake funcitonal architecture
we proposed a functional data lake architectur, which contains four essential zones, and each zone has a task area (dotted rectangle) and a data storage area (gray rectangle) :

- **Raw data zone**: all types of data are ingested without processing and stored in their native format. The ingestion can be batch, real-time or hybrid. This zone allows users to find the original version of data for their analytics to facilitate subsequent treatments. The stored raw data format can be different from the source format.
- **Process zone**: in this zone, users can transform data according to their requirements and store all the intermediate data. The data processing includes batch and/or real-time processing. This zone allows users to prepare data for their data analytics.
- **Access zone**: the access zone stores all the available data for data analytics and provides the access of data. This zone allows self-service data consumption for different analytics (reporting, statistical analysis, business intelligence analysis, machine learning algorithms).
- **Governance zone**: data governance is applied on all the other zones. It is in charge of insuring data security, data quality, data life-cycle, data access and metadata management. The core of data governance in a data lake is the metadata management.


<img src="https://github.com/yanzhao-irit/data-lake-metadata-management-system/blob/main/images/data-lake-architecture.png" width="700">


> [Data Lakes: Trends and Perspectives. DEXA (1) 2019: 304-313 Franck Ravat, Yan Zhao
](https://link.springer.com/chapter/10.1007/978-3-030-27615-7_23)


## Metadata model
To prevent a data lake from becoming a data swamp which is invisible, incomprehensible and inaccessible, we proposed a basic metadata model we extended this model for different types of elements (data, processes, analyses).

> [Metadata Management for Data Lakes. ADBIS 2019: 37-44 Franck Ravat, Yan Zhao
](https://link.springer.com/chapter/10.1007/978-3-030-30278-8_5)
> [Metadata Management on Data Processing in Data Lakes. SOFSEM 2021: 553-562 	Imen Megdiche, Franck Ravat, Yan Zhao](https://link.springer.com/chapter/10.1007/978-3-030-67731-2_40)


## Metadata management application
We developped a matadata management application which allows users to find, access, interoperate and reuse stored datasets, preformed processes and analyses in a data lake.

In the application, users can search different elements with tags and filters.

<img src="https://github.com/yanzhao-irit/data-lake-metadata-management-system/blob/main/images/appli-menu.png" width="700">


## Getting started

1. Make sure you have a metadata database (Neo4j) that respects the model proposed by Yan ZHAO. We provide an [example database](https://github.com/yanzhao-irit/data-lake-metadata-management-system/tree/main/example-metadata) that you can download and test the application.

2. Make sure that you have installed [Node.js](https://nodejs.org/en/download/) in your computer. 

3. Make sure that you have installed [Postgresql](https://www.enterprisedb.com/downloads/postgres-postgresql-downloads) and [Oracle base](https://www.oracle.com/fr/database/technologies/oracle-database-software-downloads.html).

4. Download or clone the application.

5. Start a windows cmd at the downloaded application repository 
- **Install yarn**:

    ```
    npm install --global yarn
    ```
    If you have problem with yarn install(request to https://registry.npmjs.org/yarn failed, reason: getaddrinfo ENOTFOUND myproxy.example.com), you may need to set the proxy with 
    ```
    npm config set proxy http://example.com:8080
    npm config rm proxy
    npm config rm https-proxy
    ```
    In the end, build electron with 
    ```
    yarn add electron-builder --dev
    ```

6. Install windows-build-tools, start a cmd with administrator rights at your system with 
    ```
    npm install --global --production windows-build-tools
    ```

7. Install node-gyp, start a cmd with administrator rights at your system with 
    ```
    npm install --global node-gyp
    ```

8. Find python.exe, then start a cmd with administrator rights at your system and set up the python environment with

    ```
    npm config set python "path of your python.exe"(For example: "C:\Users\zhous\.windows-build-tools\python27\python.exe")
    ```

9. If you are a windows user, you need to install [Microsoft Visual C++ Redistributable for Visual Studio](https://support.microsoft.com/en-us/topic/the-latest-supported-visual-c-downloads-2647da03-1eea-4433-9aff-95f26a218cc0)(The installation requires a restart of the computer)


11. Start a windows cmd at the downloaded application repository and download all necessary dependencies with 
    ```
    npm install
    ```

12. Create a file named *store-password.json* at the root repository of the application and write your neo4j password in it.

    ```json
    {
        "password" : "Your password"
    }
    ```

13. Start the application at the downloaded application repository.

    ```
    npm start
    ```

    or

    ```
    npm run start
    ```

