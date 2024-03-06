from flask import Flask, render_template, request, jsonify
from pymongo import MongoClient

# Accesses William Yang's MongoDB client...
client = MongoClient("mongodb+srv://wyang25:<password>@cluster0.l0ejen6.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0")
# ...Finds the database named Cluster0 in my account...
db = client['Cluster0']
# ...and pulls up a collection of data (in this case, the neighborhoods of sample restaurants)
collection = db['sample_restaurants.neighborhoods']
# Then, we decide on something that we want (a neighborhood in this case)...
query = {"name": "Bedford"}
# ... search for it in the collection.
results = collection.find(query)
app = Flask(__name__)

# Define routes
@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/data', methods=['GET'])
def get_data():
    # Attempting to send data to front end. Warning! Does not work,
    # Even when password is inputted into the url correctly!
    data = results
    return jsonify(data)

if __name__ == '__main__':
    app.run(debug=True)
