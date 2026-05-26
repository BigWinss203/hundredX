const { Connection, PublicKey, clusterApiUrl } = require('@solana/web3.js');
const dotenv = require('dotenv');

dotenv.config();

// Initialize Solana connection
const SOLANA_RPC_URL = process.env.SOLANA_RPC_URL || clusterApiUrl('mainnet-beta');
const connection = new Connection(SOLANA_RPC_URL, 'confirmed');

// Token program ID (SPL Token Program)
const TOKEN_PROGRAM_ID = new PublicKey('TokenkegQfeZyiNwAJsyFbPVwwQQfKLwNqFjWLvkSk9');

const getSolanaConnection = () => {
  return connection;
};

const getTokenInfo = async (mintAddress) => {
  try {
    const mint = new PublicKey(mintAddress);
    const account = await connection.getParsedAccountInfo(mint);
    
    if (!account.value) {
      throw new Error('Token not found');
    }

    const data = account.value.data;
    if (typeof data === 'object' && 'parsed' in data) {
      return {
        mint: mintAddress,
        decimals: data.parsed.info.decimals,
        supply: data.parsed.info.supply
      };
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching token info:', error);
    throw error;
  }
};

const getTokenPrice = async (mintAddress) => {
  try {
    // This would typically call an external API like CoinGecko or BirdEye
    // For now, returning a placeholder
    const response = await fetch(`https://api.coingecko.com/api/v3/simple/token_price/solana?contract_addresses=${mintAddress}&vs_currencies=usd`);
    const data = await response.json();
    return data[mintAddress.toLowerCase()]?.usd || 0;
  } catch (error) {
    console.error('Error fetching token price:', error);
    return 0;
  }
};

module.exports = {
  connection,
  getSolanaConnection,
  getTokenInfo,
  getTokenPrice,
  TOKEN_PROGRAM_ID,
  SOLANA_RPC_URL
};
