# ToDo List:
- [ ] Finishing the project  (optional)
- [ ] Making a Kebab BBQ afterwards



To send commands from esp32 to server use this approach {
CommandType : "Initialize"
Payload : Object
{
Engine : true
}
}

For example when the esp32 sends commands back , that will tell the client that is initialized will send this message
CommandType : "Initialized"
Payload : Object
{
InitializeEngine:true
}
}
