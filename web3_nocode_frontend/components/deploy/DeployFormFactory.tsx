"use client";

import { Box, Tabs, TabList, TabPanels, Tab, TabPanel } from "@chakra-ui/react";
import DeployERC20Form from "./DeployERC20Form";
import DeployERC721Form from "./DeployERC1155Form";
import DeployERC1155Form from "./DeployERC1155Form";
import DeployFromABIForm from "./DeployFromABIForm";

interface Props {
  userAddress: string;
  onDeployed?: () => void;
}

export default function DeployFormFactory({ userAddress, onDeployed }: Props) {
  return (
    <Box w="full" maxW="520px">
      <Tabs variant="soft-rounded" colorScheme="purple" isFitted>
        <TabList mb={6}>
          <Tab>ERC20</Tab>
          <Tab>ERC721</Tab>
          <Tab>ERC1155</Tab>
          <Tab>Custom ABI</Tab>
        </TabList>

        <TabPanels>
          <TabPanel>
            <DeployERC20Form
              userAddress={userAddress}
              onDeployed={onDeployed}
            />
          </TabPanel>

          <TabPanel>
            <DeployERC721Form
              userAddress={userAddress}
              onDeployed={onDeployed}
            />
          </TabPanel>

          <TabPanel>
            <DeployERC1155Form
              userAddress={userAddress}
              onDeployed={onDeployed}
            />
          </TabPanel>

          <TabPanel>
            <DeployFromABIForm
              userAddress={userAddress}
              onDeployed={onDeployed}
            />
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Box>
  );
}
