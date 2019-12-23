import gearman
import json

import threading
local_data = threading.local()

class JsonDataEncoder(gearman.DataEncoder):
    @classmethod
    def encode(cls, encodable_object):
        return json.dumps(encodable_object)

    @classmethod
    def decode(cls, decodable_string):
        return json.loads(decodable_string)

class JsonClient(gearman.GearmanClient):
    data_encoder = JsonDataEncoder

class JsonWorker(gearman.GearmanWorker):
    data_encoder = JsonDataEncoder

local_data.gm_client = None
def get_client():
    if local_data.gm_client is not None:
        return local_data.gm_client
    local_data.gm_client = client = JsonClient(['gearman:4730'])
    return client

def get_worker():
    return JsonWorker(['gearman:4730'])
