// SPDX-License-Identifier: UNLICENSED
// Partial copy of the following code. Huge thanks to them!
// https://github.com/witnet/elliptic-curve-solidity/blob/master/examples/Secp256k1.sol
pragma solidity ^0.6.4;

library EllipticCurve {
    function invMod(uint256 _x, uint256 _pp) internal pure returns (uint256) {
        require(_x != 0 && _x != _pp && _pp != 0, "Invalid number");
        uint256 q = 0;
        uint256 newT = 1;
        uint256 r = _pp;
        uint256 t;
        while (_x != 0) {
            t = r / _x;
            (q, newT) = (newT, addmod(q, (_pp - mulmod(t, newT, _pp)), _pp));
            (r, _x) = (_x, r - t * _x);
        }

        return q;
    }

    function toAffine(uint256 _x, uint256 _y, uint256 _z, uint256 _pp)
        internal pure returns (uint256, uint256) {
        uint256 zInv = invMod(_z, _pp);
        uint256 zInv2 = mulmod(zInv, zInv, _pp);
        uint256 x2 = mulmod(_x, zInv2, _pp);
        uint256 y2 = mulmod(_y, mulmod(zInv, zInv2, _pp), _pp);

        return (x2, y2);
    }

    function ecMul(uint256 _k) internal pure returns(uint256, uint256) {
        uint256 GX = 0x79BE667EF9DCBBAC55A06295CE870B07029BFCDB2DCE28D959F2815B16F81798;
        uint256 GY = 0x483ADA7726A3C4655DA4FBFC0E1108A8FD17B448A68554199C47D08FFB10D4B8;
        uint256 AA = 0;
        uint256 PP = 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEFFFFFC2F;

        (uint256 x1, uint256 y1, uint256 z1) = jacMul(
            _k, GX, GY, 1, AA, PP
        );

        return toAffine(x1, y1, z1, PP);
    }

    function jacAdd(uint256 _x1, uint256 _y1, uint256 _z1, uint256 _x2, uint256 _y2, uint256 _z2, uint256 _pp)
        internal pure returns (uint256, uint256, uint256) {
        if (_x1==0 && _y1==0) return (_x2, _y2, _z2);
        if (_x2==0 && _y2==0) return (_x1, _y1, _z1);

        uint[4] memory zs; // z1^2, z1^3, z2^2, z2^3
        zs[0] = mulmod(_z1, _z1, _pp);
        zs[1] = mulmod(_z1, zs[0], _pp);
        zs[2] = mulmod(_z2, _z2, _pp);
        zs[3] = mulmod(_z2, zs[2], _pp);

        zs = [
            mulmod(_x1, zs[2], _pp), mulmod(_y1, zs[3], _pp),
            mulmod(_x2, zs[0], _pp), mulmod(_y2, zs[1], _pp)
        ];

        require(zs[0] != zs[2] || zs[1] != zs[3], "Use jacDouble function instead");

        uint[4] memory hr;
        hr[0] = addmod(zs[2], _pp - zs[0], _pp);
        hr[1] = addmod(zs[3], _pp - zs[1], _pp);
        hr[2] = mulmod(hr[0], hr[0], _pp);
        hr[3] = mulmod(hr[2], hr[0], _pp);
        uint256 qx = addmod(mulmod(hr[1], hr[1], _pp), _pp - hr[3], _pp);
        qx = addmod(qx, _pp - mulmod(2, mulmod(zs[0], hr[2], _pp), _pp), _pp);
        uint256 qy = mulmod(hr[1], addmod(mulmod(zs[0], hr[2], _pp), _pp - qx, _pp), _pp);
        qy = addmod(qy, _pp - mulmod(zs[1], hr[3], _pp), _pp);
        uint256 qz = mulmod(hr[0], mulmod(_z1, _z2, _pp), _pp);

        return(qx, qy, qz);
    }

    function jacDouble(uint256 _x, uint256 _y, uint256 _z, uint256 _aa, uint256 _pp)
        internal pure returns (uint256, uint256, uint256) {
        if (_z == 0) return (_x, _y, _z);

        uint256 x = mulmod(_x, _x, _pp); //x1^2
        uint256 y = mulmod(_y, _y, _pp); //y1^2
        uint256 z = mulmod(_z, _z, _pp); //z1^2
        uint s = mulmod(4, mulmod(_x, y, _pp), _pp);
        uint m = addmod(mulmod(3, x, _pp), mulmod(_aa, mulmod(z, z, _pp), _pp), _pp);

        x = addmod(mulmod(m, m, _pp), _pp - addmod(s, s, _pp), _pp);
        y = addmod(mulmod(m, addmod(s, _pp - x, _pp), _pp), _pp - mulmod(8, mulmod(y, y, _pp), _pp), _pp);
        z = mulmod(2, mulmod(_y, _z, _pp), _pp);

        return (x, y, z);
    }

    function jacMul(uint256 _d, uint256 _x, uint256 _y, uint256 _z, uint256 _aa, uint256 _pp)
        internal pure returns (uint256, uint256, uint256) {
        if (_d == 0) return (_x, _y, _z);

        uint256 remaining = _d;
        uint256 qx = 0;
        uint256 qy = 0;
        uint256 qz = 1;

        // Double and add algorithm
        while (remaining != 0) {
            if ((remaining & 1) != 0) (qx, qy, qz) = jacAdd(qx, qy, qz, _x, _y, _z, _pp);
            remaining = remaining / 2;
            (_x, _y, _z) = jacDouble(_x, _y, _z, _aa, _pp);
        }

        return (qx, qy, qz);
    }
}

contract FairDelegation2 {
    bytes32 public pkSp; // Two parts of SP's public key
    bytes32 public pkSp2;
    uint256 public wage; // Storage to escrow currencies mid-transaction

    // Event triggered after the service provider's push (Step 10)
    event ServiceProviderTrigger(bytes32 k);

    // Event triggered after the customer's push (Step 8)
    event CustomerTrigger(bytes32 k, bytes32 k2, uint256 w);

    constructor() public payable {
        wage = msg.value;
    }

    function pair(bytes32 pk, bytes32 pk2, bytes32 sk) public pure returns (bool) {
        // Derive public key from the private key `sk`
        (uint256 xValue, uint256 yValue) = EllipticCurve.ecMul(uint256(sk));

        // Comparing public key with the private key derived public key.
        return keccak256(abi.encode(pk, pk2)) == keccak256(abi.encode(bytes32(xValue), bytes32(yValue)));
    }

    function customer(bytes32 pk, bytes32 pk2) public payable {
        pkSp = pk;    // Store the service provider's
        pkSp2 = pk2;  // public key sent by the customer
        wage = msg.value; // Store the customer's wage

        emit CustomerTrigger(pkSp, pkSp2, wage);
    }

    function serviceProvider(bytes32 skSp) public payable {
        if (pair(pkSp, pkSp2, skSp)) { // if P(pkSp, skSp) is true
            msg.sender.transfer(wage); // Send customer's wage to SP
            wage = 0;
            emit ServiceProviderTrigger(skSp);
        }
    }
}
