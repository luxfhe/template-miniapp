import { loadFixture } from '@nomicfoundation/hardhat-toolbox/network-helpers'
import hre from 'hardhat'
import { fhe, Encryptable, FheTypes } from '@luxfhe/sdk/node'

describe('Counter', function () {
	async function deployCounterFixture() {
		// Contracts are deployed using the first signer/account by default
		const [signer, signer2, bob, alice] = await hre.ethers.getSigners()

		const Counter = await hre.ethers.getContractFactory('Counter')
		const counter = await Counter.connect(bob).deploy()

		return { counter, signer, bob, alice }
	}

	describe('Functionality', function () {
		beforeEach(function () {
			if (!hre.fhe.isPermittedEnvironment('MOCK')) this.skip()

			// NOTE: Uncomment for global logging
			// hre.fhe.mocks.enableLogs()
		})

		afterEach(function () {
			if (!hre.fhe.isPermittedEnvironment('MOCK')) return

			// NOTE: Uncomment for global logging
			// hre.fhe.mocks.disableLogs()
		})

		it('Should increment the counter', async function () {
			const { counter, bob } = await loadFixture(deployCounterFixture)
			const count = await counter.count()
			await hre.fhe.mocks.expectPlaintext(count, 0n)

			await hre.fhe.mocks.withLogs('counter.increment()', async () => {
				await counter.connect(bob).increment()
			})

			const count2 = await counter.count()
			await hre.fhe.mocks.expectPlaintext(count2, 1n)
		})
		it('fhe unseal (mocks)', async function () {
			await hre.fhe.mocks.enableLogs('fhe unseal (mocks)')
			const { counter, bob } = await loadFixture(deployCounterFixture)

			await hre.fhe.expectResultSuccess(hre.fhe.initializeWithHardhatSigner(bob))

			const count = await counter.count()
			const unsealedResult = await fhe.unseal(count, FheTypes.Uint32)
			console.log('unsealedResult', unsealedResult)
			await hre.fhe.expectResultValue(unsealedResult, 0n)

			await counter.connect(bob).increment()

			const count2 = await counter.count()
			const unsealedResult2 = await fhe.unseal(count2, FheTypes.Uint32)
			await hre.fhe.expectResultValue(unsealedResult2, 1n)

			await hre.fhe.mocks.disableLogs()
		})
		it('fhe encrypt (mocks)', async function () {
			const { counter, bob } = await loadFixture(deployCounterFixture)

			await hre.fhe.expectResultSuccess(hre.fhe.initializeWithHardhatSigner(bob))

			const [encryptedInput] = await hre.fhe.expectResultSuccess(fhe.encrypt([Encryptable.uint32(5n)] as const))
			await hre.fhe.mocks.expectPlaintext(encryptedInput.ctHash, 5n)

			await counter.connect(bob).reset(encryptedInput)

			const count = await counter.count()
			await hre.fhe.mocks.expectPlaintext(count, 5n)

			const unsealedResult = await fhe.unseal(count, FheTypes.Uint32)
			await hre.fhe.expectResultValue(unsealedResult, 5n)
		})
	})
})
