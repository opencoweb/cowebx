'''
Copyright (c) The Dojo Foundation 2011. All Rights Reserved.
Copyright (c) IBM Corporation 2008, 2011. All Rights Reserved.
'''
import coweb.updater
import logging

log = logging.getLogger('example')

class ExampleUpdaterTypeMatcher(coweb.updater.UpdaterTypeMatcherBase):
    def __init__(self, container):
        coweb.updater.UpdaterTypeMatcherBase.__init__(self, container)
        self.lookup = {"type1" : ["type1", "type3"], "type2" : ["type2", "type4"], "type3" : ["type3"], "type4" : ["type4"]}
        
    def match(self, updateeType, availableUpdaterTypes):
        log.info('updateeType = %s', updateeType)
        for availableUpdaterType in availableUpdaterTypes:
            if availableUpdaterType in self.lookup.keys():
                matches = self.lookup[availableUpdaterType]
                if updateeType in matches:
                    log.info('%s matched to %s', updateeType, availableUpdaterType)
                    return availableUpdaterType
            else:
                log.info('availableUpdaterType %s is not in lookup table', availableUpdaterType)
                    
        return None
