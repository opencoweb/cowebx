
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

    def canClientSubscribeService(self, svcName, cl, msg):
        return True

    def canClientMakeServiceRequest(self, svcName, cl, msg):
        return True

    def onSessionReady(self):
        self._ready = True
        self.collab = self.initCollab("shoppinglist")
        self.collab.subscribeService("echo")

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

        self.collab.postService("echo", {"coffee":"123"})
        #self.collab.sendSync("chat", "hello", "insert", 0)

    def onServiceResponse(self, svcName, data, error, isPub):
        print("MOD::onServiceResponse",svcName,data,error,isPub)

