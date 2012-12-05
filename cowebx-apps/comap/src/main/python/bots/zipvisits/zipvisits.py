'''
Copyright (c) The Dojo Foundation 2011. All Rights Reserved.
Copyright (c) IBM Corporation 2008, 2011. All Rights Reserved.
'''
# std lib
import random
# coweb
import coweb.bot

class ZipVisitsBot(object):
    def __init__(self, botWrapper, *args):
      self.bot = botWrapper
      self.visits = {}
      self.timer = None

    def on_request(self, params, token, username):
        uuid = params.get("uuid")
        visitCount = self.getVisitCount(params)
        self.visits[uuid] = visitCount
        self.bot.reply(token, {"reply": "acknowledged"})
        if self.timer is None:
            # start a timer to publish data every 5 sec
            self.timer = self.bot.add_timer(5, self.on_timer)

    def getVisitCount(esfl, params):
        return random.randint(0, 1000)

    def updateVisits(self):
        for uuid in self.visits:
            cnt = self.visits.get(uuid)
            self.visits[uuid] = self.visits[uuid] + random.randint(0, 10)

    def on_timer(self):
        # update counts for marker; if we weren't faking data, this is where
        # we'd go off a fetch the info
        self.updateVisits()
        # publish the updated results back to clients; include all the markers
        # but we could send just those that updated
        self.bot.publish(self.visits)
        # schedule next timer interval
        self.timer = self.bot.add_timer(5, self.on_timer)

    def on_shutdown(self):
        # make sure we're not hanging on a timer
        if self.timer:
            self.bot.remove_timer(self.timer)
            self.timer = None

coweb.bot.run(ZipVisitsBot)

