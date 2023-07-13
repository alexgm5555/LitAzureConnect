import {PublicClientApplication, LogLevel } from '@azure/msal-browser/dist';
import { LitElement, html, css } from 'lit';
import "wired-elements/lib/wired-button";

const config = {
  auth: {
    clientId: '47ff46ec-355f-4c89-9c3d-c6bbfa75e1c6'
  }
}

function callMSGraph(endpoint, accessToken, callback) {
  const headers = new Headers();
  const bearer = `Bearer ${accessToken}`;

  headers.append("Authorization", bearer);

  const options = {
    method: "GET",
    headers: headers
  };

  console.log('request made to Graph API at: ' + new Date().toString());

  fetch(endpoint, options)
    .then(response => response.json())
    .then(response => callback(response, endpoint))
    .catch(error => console.log(error));
}

export class TestCounter extends LitElement {
  static styles = [
    css`
      :host {
        display: block;
      }
      .test-counter-container {
        display: flex;
        justify-content: space-between;
        flex-direction: column;
        align-items: center;
      }
    `
  ];

  static properties = {
    counter: {type: Number, Reflect: true},
    name: {type: String, Reflect: true}
  }

  constructor() {
    super();
    this.counter= 10;
    this.name="...";
  }

  firstUpdated() {
    this.connectAzure1();
  }


  render() {
    return html`
      <div class="test-counter-container">
        <h1> Lit WebComponent</h1>
        <h3 id="name">${this.name}</h3>
        <slot></slot>
        <wired-button @click=${this.connectAzure}>Azure Login</wired-button >
      </div>
    `;
  }

  increment() {
    this.counter++;
  }

  async connectAzure1 () {
    const myMSALObj = new PublicClientApplication(config);
    
    const currentAccounts = myMSALObj.getAllAccounts();
    const loginRequest = {
      scopes: [ 'User.Read' ]
    };
    const loginRedirectRequest = {
      ...loginRequest,
      redirectStartPage: window.location.href
    };
    console.log(!currentAccounts[0]);
    if (currentAccounts === null || !currentAccounts[0]) {
      await myMSALObj.loginPopup(loginRequest).then((resp) => {
        callMSGraph('https://graph.microsoft.com/v1.0/me',resp.accessToken, (respta)=> {
          // console.log(userPrincipalName);
          this.name= respta.userPrincipalName;
        })
      }).catch((error)=>{
        this.name= "Usuario invalido!!!";
        console.error(error);
      });
    }

    if (currentAccounts.length > 1) {
      // Add choose account code here
      console.log("Multiple accounts detected, need to add choose account code.");
    } else if (currentAccounts.length === 1) {
      this.name= currentAccounts[0].username;
    }
    console.log(currentAccounts[0]);
  }
}

customElements.define('test-counter', TestCounter);
