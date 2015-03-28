import gearman
import json

class JsonDataEncoder(gearman.DataEncoder):
    @classmethod
    def encode(cls, encodable_object):
        return json.dumps(encodable_object)

    @classmethod
    def decode(cls, decodable_string):
        return json.loads(decodable_string)

class JsonClient(gearman.GearmanClient):
    data_encoder = PickleDataEncoder

class JsonWorker(gearman.GearmanWorker):
    data_encoder = JsonDataEncoder

def get_client():
    return JsonClient(['localhost:4730'])

def get_worker():
    return JsonWorker(['localhost:4730'])
