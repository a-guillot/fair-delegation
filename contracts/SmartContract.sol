// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.6.4;

contract SmartContract {
    mapping (bytes32 => uint256) public likesReceived;
    bytes32[] public postList;

    // Initialize the contract with a set of immutable posts.
    constructor(bytes32[] memory postNames) public {
        postList = postNames;
    }

    // View since it does not modify the state and should only be called.
    function totalLikesFor(bytes32 post) view public returns (uint256) {
        return likesReceived[post];
    }

    // Modify the state of the contract to act upon the posts
    function likePost(bytes32 post) public {
        likesReceived[post] += 1;
    }
}
