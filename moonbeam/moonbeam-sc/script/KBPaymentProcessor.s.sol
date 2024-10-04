// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Script, console} from "forge-std/Script.sol";
import {KBPaymentProcessor} from "../src/KBPaymentProcessor.sol";

contract KBPaymentProcessorScript is Script {
    KBPaymentProcessor public processor;

    function setUp() public {}

    function run() public {
        vm.startBroadcast();

        processor = new KBPaymentProcessor(200, 0x28d55A4Ddf57BFb6EEB7dA7172191C240936Df3d);

        vm.stopBroadcast();
    }
}
