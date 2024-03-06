from flask import Flask, render_template, request, jsonify
from pymongo import MongoClient

# Accesses the MongoDB database and finds the first 10 restaurants whose
# cuisine type is American
# Removed URL link for safety reasons
client = MongoClient()
db = client['sample_restaurants']
collection = db['restaurants']
query = {"cuisine": "American"}
results = collection.find(query).limit(10)
# Creates an enumerated string list of said restaurants
test = ""
i = 1
for result in results:
  test += str(i) + ". " + result["name"] + "\n"
  i += 1

app = Flask(__name__)

# Define routes
@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/data', methods=['GET'])
def get_data():
    # Prints out the enumerated list from earlier.
    # Does not correctly include the newline character.
    data = {"message": test}
    return jsonify(data)

if __name__ == '__main__':
    app.run(debug=True)
