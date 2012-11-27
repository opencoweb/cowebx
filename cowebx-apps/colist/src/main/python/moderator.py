
import json
from coweb.moderator import DefaultSessionModerator

def _item(a,b,c):
    return {"id":a,"name":b,"amount":c}

class ListModerator(DefaultSessionModerator):

    def __init__(self):
        super(DefaultSessionModerator, self).__init__()
        self.bgData = []
        self._ready = False
        self.collab = None

    def onSessionReady(self):
        self._ready = True
        print("onSessionReady")
        self.collab = self.initCollab("shoppinglist")

    def onSessionEnd(self):
        self._ready = False
        print("onSessionEnd")
        self.collab = None

    def getLateJoinState(self):
        return {"shoppinglist": self.bgData}

    def onSync(self, client, data):
        if "coweb.sync.change.shoppinglist" != data["topic"]:
            print("ListModerator.onSync(%s)" % data["topic"])
            return
        ty = data["type"]
        pos = data["position"]
        v = data["value"]
        if "insert" == ty:
            self.bgData.insert(pos, v["row"])
        elif "update" == ty:
            attr = v["attr"]
            self.bgData[pos][attr] = v["row"][attr]
        elif "delete" == ty:
            self.bgData.pop(pos)

        self.collab.sendSync("chat", "hello", "insert", 0)

