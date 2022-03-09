import { ethers } from 'ethers'

/**
 * Defines the configuration for a deployment.
 */
export interface DeployConfig {
  /**
   * Name of the network to deploy to. Must be the name of one of the networks listed in
   * hardhat.config.ts.
   */
  network: string

  /**
   * Whether or not this network is a forked network.
   */
  isForkedNetwork?: boolean

  /**
   * Optional number of confs to wait during deployment.
   */
  numDeployConfirmations?: number

  /**
   * Optional gas price to use for deployment transactions.
   */
  gasPrice?: number

  /**
   * Estimated average L1 block time in seconds.
   */
  l1BlockTimeSeconds: number

  /**
   * Gas limit for blocks on L2.
   */
  l2BlockGasLimit: number

  /**
   * Chain ID for the L2 network.
   */
  l2ChainId: number

  /**
   * Discount divisor used to calculate gas burn for L1 to L2 transactions.
   */
  ctcL2GasDiscountDivisor: number

  /**
   * Cost of the "enqueue" function in the CTC.
   */
  ctcEnqueueGasCost: number

  /**
   * Fault proof window in seconds.
   */
  sccFaultProofWindowSeconds: number

  /**
   * Sequencer publish window in seconds.
   */
  sccSequencerPublishWindowSeconds: number

  /**
   * Address of the Sequencer (publishes to CTC).
   */
  ovmSequencerAddress: string

  /**
   * Address of the Proposer (publishes to SCC).
   */
  ovmProposerAddress: string

  /**
   * Address of the account that will sign blocks.
   */
  ovmBlockSignerAddress: string

  /**
   * Address that will receive fees on L1.
   */
  ovmFeeWalletAddress: string

  /**
   * Address of the owner of the AddressManager contract on L1.
   */
  ovmAddressManagerOwner: string

  /**
   * Address of the owner of the GasPriceOracle contract on L2.
   */
  ovmGasPriceOracleOwner: string

  /**
   * Optional whitelist owner address.
   */
  ovmWhitelistOwner?: string

  /**
   * Optional initial overhead value for GPO (default: 2750).
   */
  gasPriceOracleOverhead?: number

  /**
   * Optional initial scalar value for GPO (default: 1500000).
   */
  gasPriceOracleScalar?: number

  /**
   * Optional initial decimals for GPO (default: 6).
   */
  gasPriceOracleDecimals?: number

  /**
   * Optional initial L1 base fee for GPO (default: 1).
   */
  gasPriceOracleL1BaseFee?: number

  /**
   * Optional initial L2 gas price for GPO (default: 1).
   */
  gasPriceOracleL2GasPrice?: number

  /**
   * Optional block number to enable the Berlin hardfork (default: 0).
   */
  hfBerlinBlock?: number
}

const configOptions: {
  [K in keyof DeployConfig]: {
    type: string
    default?: any
  }
} = {
  network: { type: 'string' },
  isForkedNetwork: { type: 'boolean', default: false },
  numDeployConfirmations: { type: 'number', default: 0 },
  gasPrice: { type: 'number', default: undefined },
  l1BlockTimeSeconds: { type: 'number' },
  l2BlockGasLimit: { type: 'number' },
  l2ChainId: { type: 'number' },
  ctcL2GasDiscountDivisor: { type: 'number' },
  ctcEnqueueGasCost: { type: 'number' },
  sccFaultProofWindowSeconds: { type: 'number' },
  sccSequencerPublishWindowSeconds: { type: 'number' },
  ovmSequencerAddress: { type: 'address' },
  ovmProposerAddress: { type: 'address' },
  ovmBlockSignerAddress: { type: 'address' },
  ovmFeeWalletAddress: { type: 'address' },
  ovmAddressManagerOwner: { type: 'address' },
  ovmGasPriceOracleOwner: { type: 'address' },
  ovmWhitelistOwner: { type: 'address', default: ethers.constants.AddressZero },
  gasPriceOracleOverhead: { type: 'number', default: 2750 },
  gasPriceOracleScalar: { type: 'number', default: 1_500_000 },
  gasPriceOracleDecimals: { type: 'number', default: 6 },
  gasPriceOracleL1BaseFee: { type: 'number', default: 1 },
  gasPriceOracleL2GasPrice: { type: 'number', default: 1 },
  hfBerlinBlock: { type: 'number', default: 0 },
}

/**
 * Gets the deploy config for the given network.
 *
 * @param network Network name.
 * @returns Deploy config for the given network.
 */
export const getDeployConfig = (network: string): Required<DeployConfig> => {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    return parseDeployConfig(require(`../deploy-config/${network}.ts`).default)
  } catch (err) {
    throw new Error(`no deploy config found for network: ${network}`)
  }
}

/**
 * Parses and validates the given deploy config, replacing any missing values with defaults.
 *
 * @param config Deploy config to parse.
 * @returns Parsed deploy config.
 */
export const parseDeployConfig = (
  config: DeployConfig
): Required<DeployConfig> => {
  for (const [key, val] of Object.entries(config)) {
    const opts = configOptions[key]

    // Make sure the value is defined, or use a default.
    if (val === undefined) {
      if ('default' in opts) {
        config[key] = opts.default
      } else {
        throw new Error(
          `deploy config is missing required field: ${key} (${opts.type})`
        )
      }
    }

    // Make sure the default has the correct type.
    if (opts.type === 'address' && !ethers.utils.isAddress(config[opts.name])) {
      throw new Error(
        `deploy config field: ${opts.name} is not of type ${opts.type}: ${
          config[opts.name]
        }`
      )
    } else if (typeof config[opts.name] !== opts.type) {
      throw new Error(
        `deploy config field: ${opts.name} is not of type ${opts.type}: ${
          config[opts.name]
        }`
      )
    }
  }

  return config as Required<DeployConfig>
}
