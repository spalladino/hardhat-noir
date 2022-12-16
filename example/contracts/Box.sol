// SPDX-License-Identifier: WTFPL
pragma solidity >=0.7.0;

contract Box {
  uint256 public value;
  constructor(uint256 initialValue) {
    value = initialValue;
  }
}
