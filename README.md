# data-lake-metadata-management-system

## Database Installation

You can either use your own database based on Yan Zhao's model or follow the next instruction.

### First Step : 

Get the *all.cypher* file that is the automatically extracted database in .cypher .

Launch Neo4j and create a new Database with a name and a password.

### Second Step :

Start the database, and once launched open the database folder. A shortcut is available in the manage windows of the Database within the Neo4j App.

Once open, go in *bin* folder and double-click on *cypher-shell.bat*

The shell will ask the username and the password of the database. By default the username is neo4j and the password is the password used at the database creation.

Once loged in, you have to copy-paste the whole *all.cypher* script in the shell.

## Application Installation :

### First Step :

Install Node.js 

### Second Step :

Download or clone the application from github

### Third Step :

Start a cmd at the application location and write 
```
npm install
```
 . This command will download all the necessary implementation the application need.

### Fourth Step :

While the implementation is downloading, you can create a file named *store-password.json* at the root of the application. And write your neo4j password like this.

```json
{
    "password" : "Your password"
}
```

### Fifth Step :

Once the downloading is done and the file is saved, write 

```
npm run build
```
### Last Step :

You can now run the application with 
```
npm start
```

or

```
npm run start
```

Both work.
