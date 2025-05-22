dotnet tool install -g NSwag.ConsoleCore

nswag openapi2csclient /input:http://localhost:5001/openapi/v1.json /output:SwaggerClient.cs /namespace:Generated /wrapResponses:true