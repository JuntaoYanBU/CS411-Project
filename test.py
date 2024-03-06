from flask import Flask, render_template, request, jsonify
from pymongo import MongoClient

# Accesses William Yang's MongoDB client...
client = MongoClient("mongodb+srv://wyang25:JfyjCQm6aPGwzWY4@cluster0.l0ejen6.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0")
# ...Finds the database named Cluster0 in his account...
db = client['sample_restaurants']
# ...and pulls up a collection of data (in this case, the sample restaurants)
collection = db['restaurants']
# Then, we decide on something that we want (a type of cuisine in this case)...
query = {"cuisine": "American"}
# ...search for it in the collection.
results = collection.find(query).limit(10)
# To make sure we properly queried, we'll initialize this string...
test = ""
i = 1
# ...Add some enumerated entries to it...
for result in results:
  test += str(i) + ". " + result["name"] + "\n"
  i += 1
# ...And send it to the front end later. We'll print it out now though
# To show that it works.

app = Flask(__name__)

# Define routes
@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/data', methods=['GET'])
def get_data():
    # Does not correctly include the newline character
    data = {"message": test}
    return jsonify(data)

if __name__ == '__main__':
    app.run(debug=True)
