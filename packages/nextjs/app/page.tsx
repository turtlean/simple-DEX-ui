"use client";

import type { NextPage } from "next";
import { useAccount, useReadContract, useWriteContract } from "wagmi";
import { Address } from "~~/components/scaffold-eth";
import abi from "./abi/SimpleDEX.json";
import { formatEther, parseEther } from "viem";
import React from "react";

const SimpleDEXAddress = "0x458A37Ef95BDA2950Ec4C879C7E714Ae7b2A2414"
const TokenA_Address = "0x7cB7BBEbE56dF66edDd6716E56032569510A01ba"
const TokenB_Address = "0xFBFdCdF89d2d389B0DbE5bF56C84fd16F8EaEAcf"

const Home: NextPage = () => {
  const { address: connectedAddress } = useAccount();
  const { writeContract } = useWriteContract()

  const [amountLiquidityA, setAmountLiquidityA] = React.useState("")
  const [amountLiquidityB, setAmountLiquidityB] = React.useState("")
  const [amountSwapA, setAmountSwapA] = React.useState("")
  const [amountSwapB, setAmountSwapB] = React.useState("")

  const owner: any = useReadContract({
    abi,
    address: SimpleDEXAddress,
    functionName: 'owner',
  })

  const getPrice: any = (tokenAddress: string) => useReadContract({
    abi,
    address: SimpleDEXAddress,
    functionName: 'getPrice',
    args: [tokenAddress],
  })

  const {
    data: tokenAPrice,
    refetch: refetchTokenAPrice,
  } = useReadContract({
    abi,
    address: SimpleDEXAddress,
    functionName: 'getPrice',
    args: [TokenA_Address],
  }) as { data: bigint | undefined, refetch: () => void; };

  const {
    data: tokenBPrice,
    refetch: refetchTokenBPrice,
  } = useReadContract({
    abi,
    address: SimpleDEXAddress,
    functionName: 'getPrice',
    args: [TokenB_Address],
  }) as { data: bigint | undefined, refetch: () => void; };

  const addLiquidity = () => {
    writeContract
      ? writeContract({
        abi,
        address: SimpleDEXAddress,
        functionName: 'addLiquidity',
        args: [amountLiquidityA, amountLiquidityB],
      })
      : null;
  }

  const removeLiquidity = () => {
    writeContract
      ? writeContract({
        abi,
        address: SimpleDEXAddress,
        functionName: 'removeLiquidity',
        args: [amountLiquidityA, amountLiquidityB],
      })
      : null;
  }

  const swapAforB = () => {
    writeContract
      ? writeContract({
        abi,
        address: SimpleDEXAddress,
        functionName: 'swapAforB',
        args: [amountSwapA],
      })
      : null;
  }

  const swapBforA = () => {
    writeContract
      ? writeContract({
        abi,
        address: SimpleDEXAddress,
        functionName: 'swapBforA',
        args: [amountSwapB],
      })
      : null;
  }

  const displayOwner = (address: string | undefined) => (
    address == undefined ?
      <>Loading Owner...</> :
      <>
        Owner:
        <span>
          <i> {address} </i>
        </span>
      </>
  );

  const displayPriceInWEI = (price: bigint | undefined) => (
    price == undefined ?
      <>Loading Price...</> :
      <>
        Price: <i>{formatEther(price)}</i>
      </>
  );

  const priceSection = (): JSX.Element => (
    <div className="text-center text-lg py-6">
      <div className="py-3">
        <h2>Token A</h2>
        {displayPriceInWEI(tokenAPrice)}
      </div>
      <div className="py-3">
        <h2>Token B</h2>
        {displayPriceInWEI(tokenBPrice)}
      </div>
      <button
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        onClick={() => {
          refetchTokenAPrice()
          refetchTokenBPrice()
        }}
      >
        Refresh Prices
      </button>
    </div>
  );

  const liquiditySection = (): JSX.Element => (
    <div className="text-center text-lg py-6">
      <div>
        <label className="px-6">Amount Liquidity A</label>
        <input
          type="number"
          placeholder="Amount Liquidity A"
          value={amountLiquidityA}
          onChange={e => setAmountLiquidityA(e.target.value)}
        />
      </div>
      <div>
        <label className="px-6">Amount Liquidity B</label>
        <input
          type="number"
          placeholder="Amount Liquidity B"
          value={amountLiquidityB}
          onChange={e => setAmountLiquidityB(e.target.value)}
          min="0"
        />
      </div>
      <div className="flex justify-center py-4 space-x-4">
        <button
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          onClick={() => addLiquidity()}
        >
          Add Liquidity
        </button>
        <button
          className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
          onClick={() => removeLiquidity()}
        >
          Remove Liquidity
        </button>
      </div>
    </div>
  )

  const swapSection = (): JSX.Element => (
    <>
      <div className="text-center text-lg py-6">
        <div className="py-2">
          <label className="px-6">Amount Swap A</label>
          <input
            type="number"
            placeholder="Amount Swap A"
            value={amountSwapA}
            onChange={e => setAmountSwapA(e.target.value)}
          />
        </div>
        <button
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          onClick={() => swapAforB()}
        >
          Swap A for B
        </button>
      </div>
      <div className="text-center text-lg py-6">
        <div className="py-2">
          <label className="px-6">Amount Swap B</label>
          <input
            type="number"
            placeholder="Amount Swap B"
            value={amountSwapB}
            onChange={e => setAmountSwapB(e.target.value)}
          />
        </div>
        <button
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          onClick={() => swapBforA()}
        >
          Swap B for A
        </button>
      </div>
    </>
  )

  return (
    <>
      <div className="flex items-center flex-col flex-grow pt-10">
        <div className="px-5">
          <div className="flex justify-center items-center space-x-2 flex-col sm:flex-row">
            <p className="my-2 font-medium">Connected Address:</p>
            <Address address={connectedAddress} />
          </div>
          <div className="text-center text-lg">
            {displayOwner(owner.data)}
          </div>
          {priceSection()}
          {liquiditySection()}
          {swapSection()}
        </div>
      </div>
    </>
  );
};

export default Home;
