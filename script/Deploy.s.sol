// SPDX-License-Identifier: MIT
pragma solidity 0.8.30;

import { Script, console2 } from "forge-std/Script.sol";
import { Flap }             from "../contracts/Flap.sol";
import { IERC20 }           from "openzeppelin/token/ERC20/IERC20.sol";

/**
 * Deploy Flap.
 *
 * env:
 *   PRIVATE_KEY      — deployer
 *   CUSD_ADDRESS     — cUSD on the target chain
 *   TREASURY_ADDRESS — receives sweepable surplus
 *   SCORER_ADDRESS   — server key allowed to submit scores
 *   SCORE_THRESHOLD  — initial score-to-win bar (uint128)
 *   BADGE_BASE_URI   — optional metadata gateway
 */
contract Deploy is Script {
    function run() external {
        uint256 pk = vm.envUint("PRIVATE_KEY");
        address cUSDAddress = vm.envAddress("CUSD_ADDRESS");
        address treasury = vm.envAddress("TREASURY_ADDRESS");
        address scorer = vm.envAddress("SCORER_ADDRESS");
        uint256 threshold = vm.envOr("SCORE_THRESHOLD", uint256(50));
        string memory baseURI = vm.envOr("BADGE_BASE_URI", string(""));

        vm.startBroadcast(pk);

        Flap flap = new Flap(
            IERC20(cUSDAddress),
            treasury,
            scorer,
            uint128(threshold)
        );

        if (bytes(baseURI).length > 0) {
            flap.setBaseURI(baseURI);
        }

        vm.stopBroadcast();

        console2.log("Flap:", address(flap));
        console2.log("cUSD:", cUSDAddress);
        console2.log("treasury:", treasury);
        console2.log("scorer:", scorer);
        console2.log("scoreThreshold:", threshold);
    }
}
