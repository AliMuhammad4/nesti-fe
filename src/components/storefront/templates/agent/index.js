import agentClassic from './classic';
import agentLuxuryAdvisor from './luxury-advisor';
import agentFirstHome from './first-home';
import agentInvestor from './investor';
import agentSellerExpert from './seller-expert';
import agentCommunityExpert from './community-expert';

const agentTemplates = [
  agentInvestor,
  agentClassic,
  agentFirstHome,
  agentCommunityExpert,
  agentLuxuryAdvisor,
  agentSellerExpert,
];

export default agentTemplates;
