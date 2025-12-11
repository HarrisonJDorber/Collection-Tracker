from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
import storage

app = Flask(__name__)
CORS(app)

@app.route('/collections', methods=['GET'])
def get_collections():
    collections = storage.read_collections()
    return jsonify(collections)

@app.route('/collections', methods=['POST'])
def add_collection():
    data = request.json
    collection_id = storage.add_collection(data['name'], data.get('description', ''), data.get('category', ''))
    return jsonify({'status': 'success', 'collection_id': collection_id})

@app.route('/collections/<int:collection_id>', methods=['PUT'])
def edit_collection(collection_id):
    data = request.json
    storage.edit_collection(collection_id, data['name'], data.get('description', ''), data.get('category', ''))
    return jsonify({'status': 'success'})

@app.route('/collections/<int:collection_id>', methods=['DELETE'])
def delete_collection(collection_id):
    storage.delete_collection(collection_id)
    return jsonify({'status': 'success'})

# Item routes
@app.route('/collections/<int:collection_id>/items', methods=['GET'])
def get_items(collection_id):
    items = storage.read_items(collection_id)
    return jsonify(items)

@app.route('/collections/<int:collection_id>/items', methods=['POST'])
def add_item(collection_id):
    data = request.json
    storage.add_item(
        collection_id,
        data['name'],
        data.get('set_name', ''),
        data.get('status', 'Owned'),
        data.get('quantity', 1),
        data.get('date_acquired', None),
        data.get('value', 0.0)
    )
    return jsonify({'status': 'success'})

@app.route('/items/<int:item_id>', methods=['PUT'])
def edit_item(item_id):
    data = request.json
    storage.edit_item(
        item_id,
        data['collection_id'],
        data['name'],
        data.get('set_name', ''),
        data.get('status', 'Owned'),
        data.get('quantity', 1),
        data.get('date_acquired', None),
        data.get('value', 0.0)
    )
    return jsonify({'status': 'success'})

@app.route('/items/<int:item_id>', methods=['DELETE'])
def delete_item(item_id):
    storage.delete_item(item_id)
    return jsonify({'status': 'success'})

@app.route('/clear-all', methods=['DELETE'])
def clear_all():
    storage.clear_all_data()
    return jsonify({'status': 'success'})

@app.route('/')
def index():
    return render_template('home.html')

if __name__ == '__main__':
    storage.initialise_database()
    app.run(debug=True)