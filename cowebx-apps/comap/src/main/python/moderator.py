
from coweb.moderator import DefaultSessionModerator

class ZipModerator(DefaultSessionModerator):

    def __init__(self):
        super(ZipModerator, self).__init__()
        self.collab = None
        self.isRead = False

    def onSync(self, cl, data):
        topic = data.get("topic", None)
        if topic is None:
            return

        if topic.startswith("coweb.sync.marker"):
            seqs = topic.split(".")
            action = seqs[3]
            mid = seqs[4]
            if action in ("add", "move"):
                self.updateBot(mid, data.get("value"))

    def updateBot(self, mid, value):
        value["uuid"] = mid
        self.collab.postService("zipvisits", value)

    def onSessionEnd(self):
        self.colab = None
        self.isReady = False

    def canClientMakeServiceRequest(self, svcName, cl, message):
        return False

    def canClientSubscribeService(self, svcName, cl, message):
        return True

    def onSessionReady(self):
        self.collab = self.initCollab("comap")
        self.isReady = True

    def onServiceResponse(self, svcName, data, error, isPub):
        pass

