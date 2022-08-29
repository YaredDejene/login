const SOAP_URL = "https://isapi.icu-tech.com/icutech-test.dll/soap/IICUTech";

function login(event) {
  // Get username and password
  var username = document.getElementById("username").value;
  var password = document.getElementById("password").value;

  // Prevent form submission if values are not set properly
  if (!username || !password) {
    var form = document.getElementById("form");
    form.classList.add("was-validated");

    event.preventDefault();
    event.stopPropagation();
    return;
  }

  var message = null;
  var isLoginSuccessful = false;
  changeMessageText(message, isLoginSuccessful);

  var xmlHttp = new XMLHttpRequest();
  xmlHttp.open("POST", SOAP_URL, true);

  // compose SOAP request
  var soapRequest = `<?xml version="1.0" encoding="UTF-8"?>
                    <env:Envelope
                        xmlns:env="http://www.w3.org/2003/05/soap-envelope"
                        xmlns:ns1="urn:ICUTech.Intf-IICUTech"
                        xmlns:xsd="http://www.w3.org/2001/XMLSchema"
                        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
                        xmlns:enc="http://www.w3.org/2003/05/soap-encoding">
                        <env:Body>
                            <ns1:Login env:encodingStyle="http://www.w3.org/2003/05/soap-encoding">
                                <UserName xsi:type="xsd:string">${username}</UserName>
                                <Password xsi:type="xsd:string">${password}</Password>
                                <IPs xsi:type="xsd:string"></IPs>
                            </ns1:Login>
                        </env:Body>
                    </env:Envelope>`;

  xmlHttp.onreadystatechange = function () {
    if (xmlHttp.readyState == 4) {
      if (xmlHttp.status == 200) {
        var responseJson = extractLoginResponse(
          xmlHttp.responseXML.documentElement
        );
        if (!responseJson) {
          message = "Oops! Something went wrong.";
        } else if (
          responseJson["ResultCode"] &&
          responseJson["ResultCode"] == -1
        ) {
          message = `Login failed, ${responseJson["ResultMessage"]}`;
        } else if (responseJson["EntityId"]) {
          message = `Successful login for user ${responseJson["FirstName"]} ${responseJson["LastName"]}`;
          isLoginSuccessful = true;
        }

        // Update message text
        changeMessageText(message, isLoginSuccessful);
      }
    }
  };

  // Send the SOAP request
  xmlHttp.send(soapRequest);
}

function extractLoginResponse(xmlResponse) {
  var loginResponseNodeList =
    xmlResponse.getElementsByTagName("NS1:LoginResponse");

  if (!loginResponseNodeList || loginResponseNodeList.length == 0) return null;

  var loginResponseNode = loginResponseNodeList[0];
  var responseText = loginResponseNode.childNodes[0].innerHTML;
  var responseJson = JSON.parse(responseText);

  return responseJson;
}

function changeMessageText(message, isLoginSuccessful = null) {
  var messageElm = document.getElementById("message");
  messageElm.style.color = isLoginSuccessful ? "green" : "red";
  messageElm.textContent = message;
}
