const { assert } = require('chai')

const port = Number(process.env.PORT) || 3005

describe('Элемент в каталоге', async function () {
  it('можно добавить в корзину', async function () {
    const catalogElementUrl = process.env.BUG_ID
      ? `http://localhost:${port}/hw/store/catalog/0?bug_id=${process.env.BUG_ID}`
      : `http://localhost:${port}/hw/store/catalog/0`
    await this.browser.url(catalogElementUrl)
    await this.browser.setWindowSize(1080, 1920)

    //   const firstCatalogElement = await this.browser.$('div[data-testid].ProductItem')
    //   let catalogElementId = await firstCatalogElement.getAttribute('data-testid')
    const buttonAddToCart = await this.browser.$('.ProductDetails-AddToCart')
    await expect(buttonAddToCart).toBeClickable()
    await buttonAddToCart.click()

    const successText = await this.browser.$('.CartBadge')
    await expect(successText).toExist()
    await expect(successText).toBeDisplayed()
    await expect(successText).toHaveText('Item in cart')
  })

  it('можно заказать из корзины', async function () {
    const cartUrl = process.env.BUG_ID
      ? `http://localhost:${port}/hw/store/cart?bug_id=${process.env.BUG_ID}`
      : `http://localhost:${port}/hw/store/cart`

    await this.browser.url(cartUrl)
    await this.browser.setWindowSize(1080, 1920)

    //   const firstCatalogElement = await this.browser.$('div[data-testid].ProductItem')
    //   let catalogElementId = await firstCatalogElement.getAttribute('data-testid')
    const nameInput = await this.browser.$('input#f-name')
    await nameInput.waitForExist({ timeout: 5000 })
    await nameInput.setValue('test name')

    const phoneInput = await this.browser.$('input#f-phone')
    await phoneInput.waitForExist({ timeout: 5000 })
    await phoneInput.setValue('123456789012345678')

    const addrInput = await this.browser.$('textarea#f-address')
    await addrInput.waitForExist({ timeout: 5000 })
    await addrInput.setValue('test address')

    const checkOutButton = await this.browser.$('button.Form-Submit')
    await checkOutButton.waitForExist({ timeout: 5000 })
    await expect(checkOutButton).toExist()
    await expect(checkOutButton).toBeDisplayed()
    await checkOutButton.waitForClickable({ timeout: 5000 })
    await expect(checkOutButton).toBeClickable()
    await checkOutButton.click()
  })

  it('фон карточки результата заказа зеленый', async function () {
    const resultCard = await this.browser.$('.Cart-SuccessMessage')
    await resultCard.waitForExist({ timeout: 5000 })
    await expect(resultCard).toExist()
    await expect(resultCard).toBeDisplayed()
    await expect(resultCard).toHaveElementClass('alert-success', {
      message: 'Фон карточки результата заказа не зеленый',
    })

    await this.browser.assertView('cart', '.Cart-SuccessMessage > .alert-heading')
  })
})

describe('Гамбургер', async function () {
  beforeEach(async function () {
    let url = process.env.BUG_ID
      ? `http://localhost:${port}/hw/store?bug_id=${process.env.BUG_ID}`
      : `http://localhost:${port}/hw/store`
    await this.browser.setWindowSize(400, 800)
    await this.browser.url(url)
  })
  it('появляется при маленьком разрешении экрана', async function () {
    const hamburgerButton = await this.browser.$('.Application-Toggler')
    await expect(hamburgerButton).toBeDisplayed()
    await expect(hamburgerButton).toBeClickable()
  })
  it('показывает ссылки при нажатии', async function () {
    const hamburgerButton = await this.browser.$('.Application-Toggler')
    await hamburgerButton.click()
    const hamburgerLinks = await this.browser.$('.Application-Menu')
    await expect(hamburgerLinks).toBeDisplayed()
    expect(hamburgerLinks).not.toHaveClass('collapse')
  })
  it('закрывает меню при нажатии на ссылку', async function () {
    const hamburgerButton = await this.browser.$('.Application-Toggler')
    await hamburgerButton.click()
    const catalogLink = await this.browser.$('.nav-link')
    await catalogLink.click()
    const hamburgerLinks = await this.browser.$('.Application-Menu')
    await expect(hamburgerLinks).not.toBeDisplayed()
    expect(hamburgerLinks).toHaveClass('collapse')
  })
})
