/* eslint-env jest */

const DataPoint = require('data-point')

const checkCardInputSchema = DataPoint.createTypeCheckReducer(input => {
  return typeof input.uid === 'number' && typeof input.shortTitle === 'string'
}, '{uid:Number, shortTitle:String}')

const CardModel = DataPoint.Model('Card', {
  inputType: checkCardInputSchema,
  value: {
    id: '$uid',
    title: '$shortTitle'
  }
})

describe('Card Entity', () => {
  it('should create Card Object', async () => {
    const dataPoint = DataPoint.create()
    const input = {
      uid: 123,
      shortTitle: 'Some Title'
    }

    await expect(dataPoint.resolve(CardModel, input)).resolves.toEqual({
      id: 123,
      title: 'Some Title'
    })
  })

  it('should check for input type', async () => {
    const dataPoint = DataPoint.create()

    const input = {
      shortTitle: 'Some Title'
    }

    await expect(dataPoint.resolve(CardModel, input)).rejects.toMatchSnapshot()
  })
})
