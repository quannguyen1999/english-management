from flask import Flask, jsonify
from flask_restful import Resource, Api

app = Flask(__name__)
api = Api(app)

# Define the resource
class Employees(Resource):
    def get(self):
        # Simple static response
        data = [
            {"id": 1, "name": "Alice", "role": "Developer"},
            {"id": 2, "name": "Bob", "role": "Designer"}
        ]
        return jsonify(data)

# Add route
api.add_resource(Employees, '/')

if __name__ == '__main__':
    app.run(debug=True)
