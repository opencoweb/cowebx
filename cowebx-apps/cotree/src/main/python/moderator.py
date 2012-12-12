
import json
from coweb.moderator import DefaultSessionModerator

class CotreeModerator(DefaultSessionModerator):

    def __init__(self):
        super(DefaultSessionModerator, self).__init__()
        self.arr = json.loads(_initialState)
        self.tmpChild = None

    def getLateJoinState(self):
        return {"shoppinglist": self.bgData}

    def onSync(self, client, data):
        value = data.get("value")
        ty = data.get("type")
        force = value.get("force", False)
        pos = data.get("position")
        if "insert" == ty:
            self.insert(value, pos, force)
        elif "delete" == ty:
            self.remove(value, pos, force)
        elif "update" == ty:
            self.update(value, pos)

    def update(self, value, pos):
        parent = self.findNode(value.get("parentId"))
        if parent is None:
            return
        children = parent.get("children")
        if pos >= len(children):
            return
        children[pos]["name"] = value.get("name")

    def insert(self, value, pos, force):
        if force:
            node = {"id": value.get("id"),
                    "name": value.get("value"),
                    "children": []
                    }
            parent = self.findNode(value.get("parentId"))
        else:
            node = self.tmpChild
            parent = self.findNode(value.get("newParentID"))
        if parent is None:
            return
        children = parent.get("children")
        if pos > len(children):
            return
        children.insert(pos, node)

    def remove(self, value, pos, force):
        if force:
            parent = self.findNode(value.get("parentId"))
        else:
            parent = self.findNode(value.get("prevParentID"))
        if parent is None:
            return
        children = parent.get("children")
        if pos >= len(children):
            return
        self.tmpChild = children.pop(pos)

    def findNode(self, _id):
        return self.findNodeRecursive(self.arr, _id)

    def findNodeRecursive(self, _map, _id):
        if _map["id"] == _id:
            return _map
        ch = _map["children"]
        for c in ch:
            r = self.findNodeRecursive(c, _id)
            if r is not None:
                return r
        return None

    def getLateJoinState(self):
        return {"phonebook": self.arr}

    def canClientSubscribeService(self, svcName, cl):
        return True

    def canClientMakeServiceRequest(self, svcName, cl, msg):
        return True

    def onSessionReady(self):
        pass

    def onSessionEnd(self):
        pass

_initialState = "{\"id\":\"root\", \"name\":\"Phonebook\",\"children\":[{\"id\":\"0\",\"name\":\"Person\",\"children\":[{\"id\":\"1\",\"name\":\"firstname\",\"children\":[{\"id\":\"2\",\"name\":\"Paul\",\"children\":[]}]},{\"id\":\"3\",\"name\":\"lastname\", \"children\":[ { \"id\":\"4\", \"name\":\"Bouchon\", \"children\":[] } ] }, { \"id\":\"5\", \"name\":\"address\", \"children\":[ { \"id\":\"6\", \"name\":\"home\", \"children\":[ { \"id\":\"7\", \"name\":\"street\", \"children\":[ { \"id\":\"8\", \"name\":\"101 Happy Drive\", \"children\":[] } ] }, { \"id\":\"9\", \"name\":\"city\", \"children\":[ { \"id\":\"10\", \"name\":\"New Orleans\", \"children\":[] } ] } ] } ] } ] }, { \"id\":\"11\", \"name\":\"Person\", \"children\":[ { \"id\":\"12\", \"name\":\"firstname\", \"children\":[ { \"id\":\"13\", \"name\":\"Dan\", \"children\":[] } ] }, { \"id\":\"14\", \"name\":\"lastname\", \"children\":[ { \"id\":\"15\", \"name\":\"Gisolfi\", \"children\":[] } ] }, { \"id\":\"16\", \"name\":\"address\", \"children\":[ { \"id\":\"17\", \"name\":\"home\", \"children\":[ { \"id\":\"18\", \"name\":\"street\", \"children\":[ { \"id\":\"19\", \"name\":\"102 1337 Way\", \"children\":[] } ] }, { \"id\":\"20\", \"name\":\"city\", \"children\":[ { \"id\":\"21\", \"name\":\"Palo Alto\", \"children\":[] } ] } ] } ] } ] }, { \"id\":\"22\", \"name\":\"Person\", \"children\":[ { \"id\":\"23\", \"name\":\"firstname\", \"children\":[ { \"id\":\"24\", \"name\":\"Brian\", \"children\":[] } ] }, { \"id\":\"25\", \"name\":\"lastname\", \"children\":[ { \"id\":\"26\", \"name\":\"Burns\", \"children\":[] } ] }, { \"id\":\"27\", \"name\":\"address\", \"children\":[ { \"id\":\"28\", \"name\":\"home\", \"children\":[ { \"id\":\"29\", \"name\":\"street\", \"children\":[ { \"id\":\"30\", \"name\":\"103 Windoze Drive\", \"children\":[] } ] }, { \"id\":\"31\", \"name\":\"city\", \"children\":[ { \"id\":\"32\", \"name\":\"New York\", \"children\":[] } ] } ] } ] } ] } ] }";
