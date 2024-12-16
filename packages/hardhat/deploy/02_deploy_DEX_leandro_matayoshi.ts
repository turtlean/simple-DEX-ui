import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { Contract } from "ethers";

/**
 * Deploys a contract named "DEXLeandroMatayoshi" using the deployer account and
 * constructor arguments set to the deployer address
 *
 * @param hre HardhatRuntimeEnvironment object.
 */
const deployDEXLeandroMatayoshi: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  /*
    On localhost, the deployer account is the one that comes with Hardhat, which is already funded.

    When deploying to live networks (e.g `yarn deploy --network sepolia`), the deployer account
    should have sufficient balance to pay for the gas fees for contract creation.

    You can generate a random account with `yarn generate` which will fill DEPLOYER_PRIVATE_KEY
    with a random private key in the .env file (then used on hardhat.config.ts)
    You can run the `yarn account` command to check your balance in every network.
  */
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  await deploy("DEXLeandroMatayoshi", {
    from: deployer,
    // Contract constructor arguments
    args: ["0x0562eb1D09DdCD01534D4CC74EACE1Ed0d197d07", "0x7cB7BBEbE56dF66edDd6716E56032569510A01ba", "0xFBFdCdF89d2d389B0DbE5bF56C84fd16F8EaEAcf"],
    log: true,
    // autoMine: can be passed to the deploy function to make the deployment process faster on local networks by
    // automatically mining the contract deployment transaction. There is no effect on live networks.
    autoMine: true,
  });

  // Get the deployed contract to interact with it after deploying.
  const DEXLeandroMatayoshi = await hre.ethers.getContract<Contract>("DEXLeandroMatayoshi", deployer);
};

export default deployDEXLeandroMatayoshi;

// Tags are useful if you have multiple deploy files and only want to run one of them.
// e.g. yarn deploy --tags YourContract
deployDEXLeandroMatayoshi.tags = ["DEXLeandroMatayoshi"];
