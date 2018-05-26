# homebridge-http-humidity-sensor

This [Homebridge](https://github.com/nfarina/homebridge) plugin can be used integrate your humidity sensor which has a 
http api into HomeKit.

## Configuration

```json
{
    "accessories": [
        {
          "accessory": "HTTP-HUMIDITY",
          "name": "Humidity Sensor",
          
          "getUrl": "http://localhost/api/getHumidity"
        }   
    ]
}
```

* `getUrl` is the url which is used to retrieve the current humidity in percentage. It is called using a **GET** request. 
It expected the current relative humidity as an integer without any html markup (so an integer between `0`-`100`).

## Notification Server

`homebridge-http-humidity-sensor` can be used together with 
[homebridge-http-notification-server](https://github.com/Supereg/homebridge-http-notification-server) in order to receive
updates when the state changes at your external program. For details on how to implement those updates and how to 
install and configure `homebridge-http-notification-server`, please refer to the 
[README](https://github.com/Supereg/homebridge-http-notification-server) of the repository.

Down here is an example on how to configure `homebridge-http-humidity-sensor` to work with your implementation of the 
`homebridge-http-notification-server`.

```json
{
    "accessories": [
        {
          "accessory": "HTTP-HUMIDITY",
          "name": "Humidity Sensor",
          
          "notificationID": "my-humidity-sensor",
          "notificationPassword": "superSecretPassword",
          
          "getUrl": "http://localhost/api/getHumidity"
        }   
    ]
}
```

* `notificationID` is an per Homebridge instance unique id which must be included in any http request.  
* `notificationPassword` is **optional**. It can be used to secure any incoming requests.

To get more details about the configuration have a look at the 
[README](https://github.com/Supereg/homebridge-http-notification-server).