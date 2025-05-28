import { useEffect, useRef } from "react";

export const useWebSocket = () => {
    const gateway = `ws://crazyrobot.local/ws`;
    const websocketRef = useRef<WebSocket | null>(null);

    useEffect(() => {
        initWebSocket();
        return () => {
            if (websocketRef.current) {
                websocketRef.current.close();
            }
        };
    }, []);

    const initWebSocket = () => {
        console.log('Trying to open a WebSocket connection...');
        websocketRef.current = new WebSocket(gateway);
        websocketRef.current.onopen = onOpen;
        websocketRef.current.onclose = onClose;
        websocketRef.current.onmessage = onMessage;
    };

    const onOpen = (event: Event) => {
        console.log('Connection opened ');
        console.log(event.target);
        // 👇 Immediately send a "connect" event with the client ID
    };

    const onClose = (event: CloseEvent) => {
        console.log('Connection closed');
        console.log(event.target);
        setTimeout(initWebSocket, 2000);
    };

    const onMessage = (event: MessageEvent) => {
        console.log('Received message:', event.data);
    };

    const sendData = (value: string) => {
        if (websocketRef.current && websocketRef.current.readyState === WebSocket.OPEN) {
            websocketRef.current.send(value);
        } else {
            console.warn('WebSocket is not open. Cannot send message.');
        }
    };



    return { sendData };
};
