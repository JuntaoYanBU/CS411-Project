from pymongo import MongoClient
from pymongo.server_api import ServerApi

# Connection URI
uri = "mongodb+srv://ericx:lZR7vBM3jGDBq35y@cluster0.uganlcs.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
# Create a new client and connect to the server
client = MongoClient(uri, server_api=ServerApi('1'))

# Attempt to ping the server to confirm a successful connection
try:
    client.admin.command('ping')
    print("Pinged your deployment. You successfully connected to MongoDB!")
except Exception as e:
    print(e)

# List existing databases
print(client.list_database_names())

# Access the 'farm' database and 'users' collection
db = client['farm']
collection = db['users']

# Prompt user for first name and last name
first_name = input("Enter first name: ")
last_name = input("Enter last name: ")

# Create a new user document
user_document = {
    "first_name": first_name,
    "last_name": last_name
}

# Insert the new user document into the 'users' collection
try:
    collection.insert_one(user_document)
    print("User added successfully!")
except Exception as e:
    print("An error occurred while adding the user:", e)