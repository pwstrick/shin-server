import backendUserAccount from './backendUserAccount';
import backendUserRole from './backendUserRole';
import common from './common';
import tool from './tool';
import webMonitor from './webMonitor';

const services = {
  backendUserAccount: new backendUserAccount(),
  backendUserRole: new backendUserRole(),
  common: new common(),
  tool: new tool(),
  webMonitor: new webMonitor()
};

export default services;

