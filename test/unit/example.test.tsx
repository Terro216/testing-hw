import React from 'react'

import { render, fireEvent, screen } from '@testing-library/react'
import { Provider } from 'react-redux'
import { MemoryRouter } from 'react-router-dom'
import { Application } from '../../src/client/Application'
import { checkout, checkoutEpic, initStore } from '../../src/client/store'
import '@testing-library/jest-dom'
import { ExampleApi, CartApi } from '../../src/client/api'
import { Form } from '../../src/client/components/Form'
import { CartState, CheckoutFormData, CheckoutResponse, Product } from '../../src/common/types'
import { ProductDetails } from '../../src/client/components/ProductDetails'
import { ExampleStore } from '../../src/server/data'
import axios from 'axios'
import { TestScheduler } from 'rxjs/testing'
// import userEvent from '@testing-library/user-event'

jest.mock('axios')
const basename = '/hw/store'

describe('Общие требования', () => {
  it('в шапке отображаются все ссылки', () => {
    const api = new ExampleApi(basename)
    const cart = new CartApi()
    const store = initStore(api, cart)
    const application = (
      <MemoryRouter>
        <Provider store={store}>
          <Application />
        </Provider>
      </MemoryRouter>
    )

    const { getByText } = render(application)

    expect(getByText('Catalog')).toBeInTheDocument()
    expect(getByText('Delivery')).toBeInTheDocument()
    expect(getByText('Contacts')).toBeInTheDocument()
    expect(getByText('Cart')).toBeInTheDocument()
  })

  it('Получение всех продуктов работает правильно', async () => {
    // BUG_ID=1
    const store = new ExampleStore()
    const gotProducts = store.getAllProducts(Number(process.env.BUG_ID) || -1)
    const gotProductsNames = gotProducts.map((e) => e.name)
    const allProductsHaveName = !gotProductsNames.includes(undefined)
    expect(allProductsHaveName).toBe(true)
  })
})

describe('ExampleApi', () => {
  it('RXJS', () => {
    //, BUG_ID = 5
    // let scheduler = new TestScheduler((actual, expected) => {
    //   expect(actual).toEqual(expected)
    // })
    // let api = new ExampleApi(basename)
    // let cart = new CartApi()
    // process.env.BUG_ID = '5'
    // scheduler.run(({ cold, hot, expectObservable }) => {
    //   const action$ = hot('-a', { a: checkout({} as CheckoutFormData, {} as CartState) })
    //   const output$ = checkoutEpic(action$, null, { api, cart })
    //   expectObservable(output$).toBe('-')
    //   expect(api.checkout).not.toHaveBeenCalled()
    // })
  })

  it('checkout работает правильно', async () => {
    //BUG_ID = 2
    const dateNow = Date.now()
    const api = new ExampleApi(basename)
    const mockForm: CheckoutFormData = {
      name: 'mockForm name',
      phone: 'mockForm phone',
      address: 'mockForm addr',
    }
    const mockCart: CartState = {
      0: {
        name: 'cart0 name',
        price: 123,
        count: 3,
      },
    }
    const store = new ExampleStore()

    ;(axios.post as jest.Mock).mockImplementationOnce((req) => {
      const bugId = Number(process.env.BUG_ID)

      if (bugId === 2) {
        return Promise.resolve({ data: { id: dateNow } })
      } else {
        const id = store.createOrder(req.id)
        const data: CheckoutResponse = { id }
        return Promise.resolve({ data })
      }
    })

    const checkout = await api.checkout(mockForm, mockCart)
    expect(checkout.data.id).not.toBe(dateNow)
  })

  it('получение продукта по ID работает правильно', async () => {
    //BUG_ID = 3
    const api = new ExampleApi(basename)
    const store = new ExampleStore()
    const mockedGet = (url: string) => {
      const bugId = Number(process.env.BUG_ID) || 0

      let id = Number(url.split('/').at(-1))

      if (bugId === 3) {
        id = 0
      }

      const product = store.getProductById(id)
      return Promise.resolve(product)
    }

    ;(axios.get as jest.Mock).mockImplementationOnce(mockedGet)
    const product0 = await api.getProductById(0)

    ;(axios.get as jest.Mock).mockImplementationOnce(mockedGet)
    const product1 = await api.getProductById(1)

    expect(product0).not.toEqual(product1)
  })
})

describe('Страница продукта: ', () => {
  it('на странице продукта кнопка добавить в корзину большая', () => {
    //BUG_ID = 9
    const mockProduct: Product = {
      description: 'mock description',
      material: 'mock material',
      color: 'mock color',
      id: 123,
      name: 'mock name',
      price: 123,
    }
    const basename = '/hw/store'

    const api = new ExampleApi(basename)
    const cart = new CartApi()
    const store = initStore(api, cart)
    render(
      <Provider store={store}>
        <ProductDetails product={mockProduct} />
      </Provider>
    )

    const addToCardButton = screen.getByRole('button')
    expect(addToCardButton).toHaveClass('btn-lg')
  })

  it('продукт можно добавить в корзину', async () => {
    //BUG_ID = 7
    const mockProduct: Product = {
      description: 'mock description',
      material: 'mock material',
      color: 'mock color',
      id: 123,
      name: 'mock name',
      price: 123,
    }
    const basename = '/hw/store'

    const api = new ExampleApi(basename)
    const cart = new CartApi()
    const store = initStore(api, cart)
    render(
      <Provider store={store}>
        <ProductDetails product={mockProduct} />
      </Provider>
    )

    const addToCardButton = screen.getByRole('button')
    fireEvent.click(addToCardButton)
    const successMessage = screen.getByText('Item in cart')
    expect(successMessage).toBeInTheDocument()
    expect(successMessage).toBeVisible()
  })
})

describe('Корзина: ', () => {
  describe('Форма: ', () => {
    describe('Телефонный номер', () => {
      it('не выдает ошибку при вводе корректного значения', async () => {
        //BUG_ID = 10
        const application = <Form onSubmit={() => {}} />

        const { getByLabelText, getByText } = render(application)
        const phoneInput = getByLabelText('Phone')
        expect(phoneInput).toBeInTheDocument()
        expect(phoneInput).toHaveValue('')
        fireEvent.input(phoneInput, { target: { value: '89163334455' } })
        expect(phoneInput).toHaveValue('89163334455')

        const submitButton = getByText('Checkout')
        expect(submitButton).toBeInTheDocument()
        fireEvent.click(submitButton)

        expect(phoneInput).not.toHaveClass('is-invalid')
      })

      it('выдает ошибку при вводе некорректного значения', async () => {
        const application = <Form onSubmit={() => {}} />
        const { getByLabelText, getByText } = render(application)

        const phoneInput = getByLabelText('Phone')
        expect(phoneInput).toBeInTheDocument()
        expect(phoneInput).toHaveValue('')
        fireEvent.input(phoneInput, { target: { value: '2' } })
        expect(phoneInput).toHaveValue('2')

        const submitButton = getByText('Checkout')
        expect(submitButton).toBeInTheDocument()
        fireEvent.click(submitButton)

        expect(phoneInput).toHaveClass('is-invalid')
      })
    })
  })
})
