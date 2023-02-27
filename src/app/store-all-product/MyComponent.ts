class MyComponent extends HTMLElement {
    connectedCallback() {
        this.innerHTML = `<body>
        <h1>We offer plans that help any business!</h1>
        <!-- Paste your embed code script here. -->
        <script async src="https://js.stripe.com/v3/pricing-table.js">
        </script>
        <stripe-pricing-table pricing-table-id="{{PRICING_TABLE_ID}}"
          publishable-key="pk_test_51LonaPHrqYp23LTOaGG8jWkMsITXNGuJ7vRIvKo28blmVx9C7XtcBT0bfOufKQvfJU6FUNZbiHfgA9cOAfLlMKN300JZWgyFVd">
        </stripe-pricing-table>
      </body>`;
    }
}

customElements.define('my-web-component', MyComponent);